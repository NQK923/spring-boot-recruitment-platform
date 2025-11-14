package com.recruitment.platform.userprofile.service.cv.ai;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.recruitment.platform.common.exception.ServiceException;
import com.recruitment.platform.userprofile.config.GeminiProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.MessageType;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.model.Generation;
import org.springframework.ai.chat.prompt.ChatOptions;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Component
public class GeminiCvChatModel implements ChatModel {

    private static final Logger LOG = LoggerFactory.getLogger(GeminiCvChatModel.class);

    private final WebClient webClient;
    private final GeminiProperties properties;

    public GeminiCvChatModel(WebClient.Builder webClientBuilder, GeminiProperties properties) {
        this.properties = properties;
        if (!StringUtils.hasText(properties.getApiKey())) {
            throw new ServiceException(HttpStatus.PRECONDITION_FAILED, "Chưa cấu hình GEMINI_API_KEY cho user-profile-service.");
        }
        this.webClient = webClientBuilder
            .baseUrl(properties.getBaseUrl())
            .build();
    }

    @Override
    public ChatResponse call(Prompt prompt) {
        GenerationParameters parameters = resolveParameters(prompt);
        GeminiRequest request = buildRequest(prompt, parameters);
        GeminiResponse response = webClient.post()
            .uri(uriBuilder -> uriBuilder
                .path("/models/{model}:generateContent")
                .queryParam("key", properties.getApiKey())
                .build(parameters.model()))
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(request)
            .retrieve()
            .bodyToMono(GeminiResponse.class)
            .doOnError(error -> LOG.error("Gemini generateContent thất bại", error))
            .block();
        return toChatResponse(response);
    }

    @Override
    public Flux<ChatResponse> stream(Prompt prompt) {
        return Flux.just(call(prompt));
    }

    private ChatResponse toChatResponse(GeminiResponse response) {
        String text = extractText(response);
        AssistantMessage message = new AssistantMessage(text == null ? "" : text);
        return new ChatResponse(List.of(new Generation(message)));
    }

    private GeminiRequest buildRequest(Prompt prompt, GenerationParameters parameters) {
        List<Message> instructions = prompt != null && prompt.getInstructions() != null
            ? prompt.getInstructions()
            : Collections.emptyList();
        GeminiSystemInstruction systemInstruction = buildSystemInstruction(instructions);
        List<GeminiContentPayload> contents = buildContents(instructions);
        if (contents.isEmpty()) {
            contents = List.of(new GeminiContentPayload("user", List.of(new GeminiPart("Tạo CV mới theo mẫu hiện có."))));
        }
        GeminiGenerationConfig config = new GeminiGenerationConfig(
            parameters.temperature(),
            parameters.topP(),
            parameters.topK(),
            parameters.maxTokens()
        );
        return new GeminiRequest(systemInstruction, contents, config);
    }

    private GeminiSystemInstruction buildSystemInstruction(List<Message> instructions) {
        String combined = instructions.stream()
            .filter(message -> message.getMessageType() == MessageType.SYSTEM)
            .map(Message::getText)
            .filter(StringUtils::hasText)
            .collect(Collectors.joining("\n"));
        if (!StringUtils.hasText(combined)) {
            return null;
        }
        return new GeminiSystemInstruction(List.of(new GeminiPart(combined)));
    }

    private List<GeminiContentPayload> buildContents(List<Message> instructions) {
        List<GeminiContentPayload> contents = new ArrayList<>();
        for (Message instruction : instructions) {
            if (instruction == null || instruction.getMessageType() == MessageType.SYSTEM) {
                continue;
            }
            String role = instruction.getMessageType() == MessageType.ASSISTANT ? "model" : "user";
            contents.add(new GeminiContentPayload(role, List.of(new GeminiPart(
                instruction.getText() != null ? instruction.getText() : ""
            ))));
        }
        return contents;
    }

    private GenerationParameters resolveParameters(Prompt prompt) {
        ChatOptions options = prompt != null ? prompt.getOptions() : null;
        String model = StringUtils.hasText(options != null ? options.getModel() : null)
            ? options.getModel()
            : properties.modelName();
        double temperature = options != null && options.getTemperature() != null
            ? options.getTemperature()
            : properties.getTemperature();
        Double topP = options != null && options.getTopP() != null
            ? options.getTopP()
            : properties.getTopP();
        Integer topK = options != null && options.getTopK() != null
            ? options.getTopK()
            : properties.getTopK();
        Integer maxTokens = options != null ? options.getMaxTokens() : null;
        return new GenerationParameters(model, temperature, topP, topK, maxTokens);
    }

    private String extractText(GeminiResponse response) {
        if (response == null || response.candidates() == null) {
            return "";
        }
        return response.candidates().stream()
            .filter(Objects::nonNull)
            .map(GeminiCandidate::content)
            .filter(Objects::nonNull)
            .flatMap(content -> content.parts().stream())
            .filter(Objects::nonNull)
            .map(GeminiPart::text)
            .filter(Objects::nonNull)
            .collect(Collectors.joining());
    }

    private record GenerationParameters(String model,
                                        double temperature,
                                        Double topP,
                                        Integer topK,
                                        Integer maxTokens) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private record GeminiRequest(
        GeminiSystemInstruction systemInstruction,
        List<GeminiContentPayload> contents,
        GeminiGenerationConfig generationConfig
    ) {
    }

    private record GeminiSystemInstruction(List<GeminiPart> parts) {
    }

    private record GeminiContentPayload(String role, List<GeminiPart> parts) {
    }

    private record GeminiGenerationConfig(Double temperature, Double topP, Integer topK, Integer maxOutputTokens) {
    }

    private record GeminiResponse(List<GeminiCandidate> candidates) {
    }

    private record GeminiCandidate(GeminiContent content) {
    }

    private record GeminiContent(String role, List<GeminiPart> parts) {
    }

    private record GeminiPart(String text) {
    }
}
