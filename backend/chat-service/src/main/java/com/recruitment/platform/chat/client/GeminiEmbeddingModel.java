package com.recruitment.platform.chat.client;

import com.recruitment.platform.chat.config.GeminiProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.Embedding;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.embedding.EmbeddingRequest;
import org.springframework.ai.embedding.EmbeddingResponse;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Component
public class GeminiEmbeddingModel implements EmbeddingModel {

    private static final Logger LOG = LoggerFactory.getLogger(GeminiEmbeddingModel.class);
    private static final int DEFAULT_VECTOR_DIMENSION = 3072;

    private final WebClient webClient;
    private final GeminiProperties properties;

    public GeminiEmbeddingModel(WebClient.Builder webClientBuilder, GeminiProperties properties) {
        this.properties = properties;
        this.webClient = webClientBuilder
            .baseUrl(properties.getBaseUrl())
            .build();
    }

    @Override
    public EmbeddingResponse call(EmbeddingRequest request) {
        List<String> texts = request != null && request.getInstructions() != null
            ? request.getInstructions()
            : Collections.emptyList();
        if (texts.isEmpty()) {
            return new EmbeddingResponse(Collections.emptyList());
        }
        List<Embedding> embeddings = new ArrayList<>();
        for (int i = 0; i < texts.size(); i++) {
            embeddings.add(new Embedding(embedSingleText(texts.get(i)), i));
        }
        return new EmbeddingResponse(embeddings);
    }

    @Override
    public float[] embed(Document document) {
        if (document == null) {
            return embedSingleText(null);
        }
        String content = document.isText() ? document.getText() : document.getFormattedContent();
        return embedSingleText(content);
    }

    private float[] embedSingleText(String text) {
        String sanitized = StringUtils.hasText(text) ? text : "Thông tin chưa được cung cấp.";
        try {
            GeminiEmbeddingRequest request = new GeminiEmbeddingRequest(
                new GeminiEmbeddingContent(List.of(new GeminiClient.GeminiPart(sanitized)))
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
                .doOnError(error -> LOG.error("Gemini embedContent thất bại", error))
                .block();
            if (response == null
                || response.embedding() == null
                || CollectionUtils.isEmpty(response.embedding().values())) {
                return new float[DEFAULT_VECTOR_DIMENSION];
            }
            List<Double> values = response.embedding().values();
            float[] vector = new float[values.size()];
            for (int i = 0; i < values.size(); i++) {
                vector[i] = values.get(i).floatValue();
            }
            return vector;
        } catch (Exception ex) {
            LOG.error("Gọi Gemini embedContent thất bại, trả về vector mặc định.", ex);
            return new float[DEFAULT_VECTOR_DIMENSION];
        }
    }

    private record GeminiEmbeddingRequest(GeminiEmbeddingContent content) {
    }

    private record GeminiEmbeddingContent(List<GeminiClient.GeminiPart> parts) {
    }

    private record GeminiEmbeddingResponse(GeminiEmbedding embedding) {
    }

    private record GeminiEmbedding(List<Double> values) {
    }
}
