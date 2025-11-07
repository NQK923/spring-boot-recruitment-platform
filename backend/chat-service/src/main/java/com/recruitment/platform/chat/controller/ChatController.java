package com.recruitment.platform.chat.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.recruitment.platform.chat.dto.ChatHistoryMessage;
import com.recruitment.platform.chat.dto.ChatMessageRequest;
import com.recruitment.platform.chat.dto.ChatResponse;
import com.recruitment.platform.chat.guard.IntentGuard;
import com.recruitment.platform.chat.model.ChatLanguage;
import com.recruitment.platform.chat.ratelimit.UserRateLimiter;
import com.recruitment.platform.chat.recommendation.model.JobSuggestion;
import com.recruitment.platform.chat.recommendation.service.JobRecommendationService;
import com.recruitment.platform.chat.service.ChatService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private static final Logger LOG = LoggerFactory.getLogger(ChatController.class);

    private static final int HISTORY_LIMIT = 4;
    private static final String OUT_OF_SCOPE_RESPONSE = "Mình chỉ hỗ trợ các câu hỏi liên quan đến tuyển dụng. Bạn có muốn hỏi về vị trí, quy trình ứng tuyển, hoặc cách tối ưu CV/phỏng vấn không?";
    private static final String RATE_LIMIT_MESSAGE = "Bạn đã gửi quá nhiều yêu cầu trong 1 phút. Vui lòng thử lại sau.";

    private final ChatService chatService;
    private final IntentGuard intentGuard;
    private final UserRateLimiter rateLimiter;
    private final ObjectMapper objectMapper;
    private final JobRecommendationService jobRecommendationService;

    public ChatController(ChatService chatService,
                          IntentGuard intentGuard,
                          UserRateLimiter rateLimiter,
                          ObjectMapper objectMapper,
                          JobRecommendationService jobRecommendationService) {
        this.chatService = chatService;
        this.intentGuard = intentGuard;
        this.rateLimiter = rateLimiter;
        this.objectMapper = objectMapper;
        this.jobRecommendationService = jobRecommendationService;
    }

    @PostMapping(value = "/message", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ChatResponse> message(
        @Valid @RequestBody ChatMessageRequest request,
        Authentication authentication,
        ServerHttpRequest serverRequest
    ) {
        String userKey = currentUserKey(authentication, serverRequest);
        ensureRateLimit(userKey);

        List<ChatHistoryMessage> trimmedHistory = trimHistory(request.getMessages());
        Optional<ChatHistoryMessage> latestUserMessage = trimmedHistory.stream()
            .filter(msg -> "user".equals(msg.role()))
            .reduce((first, second) -> second);

        if (request.getCompanyId() != null) {
            LOG.debug("Chat message request scoped to companyId={}", request.getCompanyId());
        }

        if (latestUserMessage.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No user message provided.");
        }

        String latestText = latestUserMessage.get().content();

        if (!intentGuard.isAllowed(latestText)) {
            return Mono.just(new ChatResponse(OUT_OF_SCOPE_RESPONSE));
        }

        if (intentGuard.isRecommendationIntent(latestText)) {
            return handleRecommendationResponse(latestText, authentication, serverRequest);
        }

        ChatLanguage language = ChatLanguage.fromCode(request.getLanguage());
        return chatService.generateResponse(trimmedHistory, language)
            .map(text -> text != null && !text.isBlank() ? text : "Xin lỗi, mình chưa có thông tin đó. Bạn có thể kiểm tra Candidate Portal hoặc liên hệ HR qua email nhé!")
            .map(ChatResponse::new);
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<String>> stream(
        @RequestParam("q") String question,
        @RequestParam(value = "language", defaultValue = "vi") String language,
        @RequestParam(value = "companyId", required = false) Long companyId,
        @RequestHeader(value = "X-Context", required = false) String encodedContext,
        Authentication authentication,
        ServerHttpRequest serverRequest
    ) {
        String userKey = currentUserKey(authentication, serverRequest);
        ensureRateLimit(userKey);

        if (companyId != null) {
            LOG.debug("Chat stream requested for companyId={}", companyId);
        }

        if (!intentGuard.isAllowed(question)) {
            return Flux.just(
                ServerSentEvent.<String>builder(OUT_OF_SCOPE_RESPONSE).event("message").build(),
                ServerSentEvent.<String>builder("").event("done").build()
            );
        }

        if (intentGuard.isRecommendationIntent(question)) {
            return streamRecommendations(question, authentication, serverRequest);
        }

        List<ChatHistoryMessage> contextMessages = decodeContext(encodedContext);
        List<ChatHistoryMessage> trimmed = trimHistory(contextMessages);
        if (trimmed.size() >= HISTORY_LIMIT) {
            trimmed = new ArrayList<>(trimmed.subList(Math.max(trimmed.size() - (HISTORY_LIMIT - 1), 0), trimmed.size()));
        }

        ChatLanguage chatLanguage = ChatLanguage.fromCode(language);
        ChatHistoryMessage currentQuestion = new ChatHistoryMessage("user", question);

        return chatService.streamResponse(trimmed, currentQuestion, chatLanguage)
            .map(chunk -> ServerSentEvent.<String>builder(chunk).event("message").build())
            .onErrorResume(error -> {
                LOG.error("Streaming chat failed", error);
                return Flux.just(ServerSentEvent.<String>builder("Xin lỗi, hệ thống đang bận. Vui lòng thử lại sau.").event("message").build());
            })
            .concatWithValues(ServerSentEvent.<String>builder("").event("done").build());
    }

    private Mono<ChatResponse> handleRecommendationResponse(String query, Authentication authentication, ServerHttpRequest request) {
        Long userId = resolveUserId(authentication, request);
        String bearerToken = extractBearerToken(request);
        return jobRecommendationService.recommend(userId, query, bearerToken)
            .map(suggestions -> {
                if (suggestions.isEmpty()) {
                    return new ChatResponse("Mình chưa tìm được việc phù hợp. Bạn có thể cho mình biết rõ hơn về kỹ năng, chức danh, địa điểm và mức lương mong muốn nhé!");
                }
                return new ChatResponse(formatRecommendationMessage(suggestions));
            });
    }

    private Flux<ServerSentEvent<String>> streamRecommendations(String query, Authentication authentication, ServerHttpRequest request) {
        Long userId = resolveUserId(authentication, request);
        String bearerToken = extractBearerToken(request);
        Flux<ServerSentEvent<String>> intro = Flux.just(ServerSentEvent.<String>builder("Đang tìm việc phù hợp cho bạn...").event("message").build());
        Flux<ServerSentEvent<String>> jobEvents = jobRecommendationService.recommendStream(userId, query, bearerToken)
            .map(suggestion -> ServerSentEvent.<String>builder(writeJobEventPayload(suggestion)).event("job").build());
        Flux<ServerSentEvent<String>> jobOrFallback = jobEvents.switchIfEmpty(
            Flux.just(ServerSentEvent.<String>builder("Mình chưa tìm thấy việc phù hợp. Bạn có thể mô tả rõ kỹ năng/chức danh, địa điểm hoặc mức lương mong muốn nhé!").event("message").build())
        );
        Flux<ServerSentEvent<String>> done = Flux.just(ServerSentEvent.<String>builder("").event("done").build());
        return Flux.concat(intro, jobOrFallback, done);
    }

    private String formatRecommendationMessage(List<JobSuggestion> suggestions) {
        StringBuilder builder = new StringBuilder("Mình gợi ý một vài việc đang mở:\n\n");
        int index = 1;
        for (JobSuggestion suggestion : suggestions) {
            builder.append(index++).append(") ").append(suggestion.title())
                .append(" – ").append(suggestion.companyName())
                .append(" (").append(suggestion.location()).append(", ").append(suggestion.workType()).append(")\n")
                .append("   Phù hợp vì: ").append(suggestion.reason()).append('\n');
            if (StringUtils.hasText(suggestion.url())) {
                builder.append("   Link: ").append(suggestion.url()).append('\n');
            }
            builder.append('\n');
        }
        builder.append("Bạn muốn thu hẹp thêm theo kỹ năng, vị trí hoặc mức lương cụ thể hơn không?");
        return builder.toString();
    }

    private String writeJobEventPayload(JobSuggestion suggestion) {
        try {
            return objectMapper.writeValueAsString(objectMapper.createObjectNode()
                .put("jobId", suggestion.jobId())
                .put("title", suggestion.title())
                .put("company", suggestion.companyName())
                .put("location", suggestion.location())
                .put("workType", suggestion.workType())
                .put("reason", suggestion.reason())
                .put("url", suggestion.url())
                .put("score", suggestion.score()));
        } catch (JsonProcessingException ex) {
            LOG.error("Không thể serialize job suggestion", ex);
            return "{\"error\":\"Không thể kết xuất dữ liệu job\"}";
        }
    }

    private Long resolveUserId(Authentication authentication, ServerHttpRequest request) {
        if (authentication != null) {
            Object credentials = authentication.getCredentials();
            if (credentials instanceof Jwt jwt) {
                Long parsed = parseUserId(jwt.getSubject());
                if (parsed != null) {
                    return parsed;
                }
            }
            Long parsed = parseUserId(authentication.getName());
            if (parsed != null) {
                return parsed;
            }
        }
        String headerUserId = request.getHeaders().getFirst("X-User-ID");
        return parseUserId(headerUserId);
    }

    private Long parseUserId(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        try {
            return Long.parseLong(value.trim());
        } catch (NumberFormatException ex) {
            return null;
        }
    }
    private String extractBearerToken(ServerHttpRequest request) {
        String header = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        return StringUtils.hasText(header) ? header : null;
    }

    private void ensureRateLimit(String userId) {
        if (!rateLimiter.tryConsume(userId)) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, RATE_LIMIT_MESSAGE);
        }
    }

    private List<ChatHistoryMessage> trimHistory(List<ChatHistoryMessage> history) {
        if (CollectionUtils.isEmpty(history)) {
            return new ArrayList<>();
        }
        List<ChatHistoryMessage> sanitized = history.stream()
            .filter(message -> message != null && StringUtils.hasText(message.content()))
            .map(message -> new ChatHistoryMessage(message.role(), truncate(message.content())))
            .collect(Collectors.toCollection(ArrayList::new));

        if (sanitized.size() <= HISTORY_LIMIT) {
            return sanitized;
        }
        return new ArrayList<>(sanitized.subList(sanitized.size() - HISTORY_LIMIT, sanitized.size()));
    }

    private String truncate(String content) {
        if (content == null) {
            return "";
        }
        int maxLength = 2000;
        if (content.length() <= maxLength) {
            return content;
        }
        return content.substring(content.length() - maxLength);
    }

    private List<ChatHistoryMessage> decodeContext(String encodedContext) {
        if (!StringUtils.hasText(encodedContext)) {
            return Collections.emptyList();
        }
        try {
            byte[] decoded;
            try {
                decoded = Base64.getUrlDecoder().decode(encodedContext);
            } catch (IllegalArgumentException ex) {
                decoded = Base64.getDecoder().decode(encodedContext);
            }
            List<ChatHistoryMessage> history = objectMapper.readValue(decoded, new TypeReference<List<ChatHistoryMessage>>() {});
            return trimHistory(history);
        } catch (JsonProcessingException ex) {
            LOG.warn("Failed to decode chat context", ex);
            return Collections.emptyList();
        } catch (IllegalArgumentException ex) {
            LOG.warn("Invalid base64 context provided", ex);
            return Collections.emptyList();
        } catch (IOException ex) {
            LOG.warn("Unable to parse chat context payload", ex);
            return Collections.emptyList();
        }
    }

    private String currentUserKey(Authentication authentication, ServerHttpRequest request) {
        if (authentication != null) {
            Object credentials = authentication.getCredentials();
            if (credentials instanceof Jwt jwt) {
                return "user:" + jwt.getSubject();
            }
            String name = authentication.getName();
            if (StringUtils.hasText(name)) {
                return "user:" + name;
            }
        }
        String forwardedFor = request.getHeaders().getFirst("X-Forwarded-For");
        if (StringUtils.hasText(forwardedFor)) {
            String ip = forwardedFor.split(",")[0].trim();
            if (StringUtils.hasText(ip)) {
                return "ip:" + ip;
            }
        }
        InetSocketAddress remoteAddress = request.getRemoteAddress();
        if (remoteAddress != null && remoteAddress.getAddress() != null) {
            String hostAddress = remoteAddress.getAddress().getHostAddress();
            if (StringUtils.hasText(hostAddress)) {
                return "ip:" + hostAddress;
            }
        }
        String userAgent = request.getHeaders().getFirst("User-Agent");
        if (StringUtils.hasText(userAgent)) {
            return "ua:" + Integer.toHexString(userAgent.hashCode());
        }
        return "anonymous";
    }
}



















