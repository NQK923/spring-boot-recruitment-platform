package com.recruitment.platform.chat.client;

import com.recruitment.platform.chat.config.GeminiProperties;
import com.recruitment.platform.chat.prompt.SystemPromptProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Component
public class GeminiClient {

    private static final Logger LOG = LoggerFactory.getLogger(GeminiClient.class);

    private final WebClient webClient;
    private final GeminiProperties properties;
    private final SystemPromptProvider systemPromptProvider;

    public GeminiClient(WebClient.Builder webClientBuilder, GeminiProperties properties, SystemPromptProvider systemPromptProvider) {
        this.properties = properties;
        this.systemPromptProvider = systemPromptProvider;
        this.webClient = webClientBuilder
            .baseUrl(properties.getBaseUrl())
            .build();
    }

    public Mono<String> generateContent(List<GeminiContent> contents) {
        GeminiRequest request = buildRequest(contents);
        return webClient.post()
            .uri(uriBuilder -> uriBuilder
                .path("/models/{model}:generateContent")
                .queryParam("key", properties.getApiKey())
                .build(properties.getModel()))
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(request)
            .retrieve()
            .bodyToMono(GeminiResponse.class)
            .map(this::extractText)
            .doOnError(error -> LOG.error("Gemini generateContent failed", error));
    }

    public Flux<String> streamContent(List<GeminiContent> contents) {
        GeminiRequest request = buildRequest(contents);
        return webClient.post()
            .uri(uriBuilder -> uriBuilder
                .path("/models/{model}:streamGenerateContent")
                .queryParam("key", properties.getApiKey())
                .build(properties.getModel()))
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(request)
            .retrieve()
            .bodyToFlux(GeminiResponse.class)
            .map(this::extractText)
            .filter(text -> text != null && !text.isBlank())
            .doOnError(error -> LOG.error("Gemini streamGenerateContent failed", error));
    }

    public float[] embedText(String text) {
        GeminiEmbeddingRequest request = new GeminiEmbeddingRequest(
            new GeminiEmbeddingContent(
                List.of(new GeminiPart(text == null ? "" : text))
            )
        );

        GeminiEmbeddingResponse response = webClient.post()
            .uri(uriBuilder -> uriBuilder
                .path("/models/{model}:embedContent")
                .queryParam("key", properties.getApiKey())
                .build(properties.getEmbeddingModel()))
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(request)
            .retrieve()
            .bodyToMono(GeminiEmbeddingResponse.class)
            .doOnError(error -> LOG.error("Gemini embedContent failed", error))
            .block();

        if (response == null || response.embedding() == null || response.embedding().values() == null) {
            return new float[0];
        }

        List<Double> values = response.embedding().values();
        float[] vector = new float[values.size()];
        for (int i = 0; i < values.size(); i++) {
            vector[i] = values.get(i).floatValue();
        }
        return vector;
    }

    private GeminiRequest buildRequest(List<GeminiContent> contents) {
        return new GeminiRequest(
            new GeminiSystemInstruction(List.of(new GeminiPart(systemPromptProvider.getPrompt()))),
            contents.stream()
                .map(content -> new GeminiContentPayload(content.role(), content.parts()))
                .collect(Collectors.toList()),
            new GeminiGenerationConfig(
                properties.getTemperature(),
                properties.getTopP(),
                properties.getMaxTokens()
            )
        );
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

    public record GeminiContent(String role, List<GeminiPart> parts) {
    }

    public record GeminiPart(String text) {
    }

    private record GeminiRequest(
        GeminiSystemInstruction systemInstruction,
        List<GeminiContentPayload> contents,
        GeminiGenerationConfig generationConfig
    ) {
    }

    private record GeminiSystemInstruction(
        List<GeminiPart> parts
    ) {
    }

    private record GeminiContentPayload(
        String role,
        List<GeminiPart> parts
    ) {
    }

    private record GeminiGenerationConfig(
        double temperature,
        double topP,
        int maxOutputTokens
    ) {
    }

    private record GeminiResponse(
        List<GeminiCandidate> candidates
    ) {
    }

    private record GeminiCandidate(
        GeminiContent content
    ) {
    }

    private record GeminiEmbeddingRequest(GeminiEmbeddingContent content) {}

    private record GeminiEmbeddingContent(List<GeminiPart> parts) {}

    private record GeminiEmbeddingResponse(GeminiEmbedding embedding) {}

    private record GeminiEmbedding(List<Double> values) {}
}
