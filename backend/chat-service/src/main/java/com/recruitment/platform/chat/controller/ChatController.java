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
import com.recruitment.platform.chat.service.ChatService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
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

    public ChatController(ChatService chatService, IntentGuard intentGuard, UserRateLimiter rateLimiter, ObjectMapper objectMapper) {
        this.chatService = chatService;
        this.intentGuard = intentGuard;
        this.rateLimiter = rateLimiter;
        this.objectMapper = objectMapper;
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

        if (!intentGuard.isAllowed(latestUserMessage.get().content())) {
            return Mono.just(new ChatResponse(OUT_OF_SCOPE_RESPONSE));
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
