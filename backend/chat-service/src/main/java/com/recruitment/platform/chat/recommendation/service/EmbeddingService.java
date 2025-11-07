package com.recruitment.platform.chat.recommendation.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
public class EmbeddingService {

    private static final Logger LOG = LoggerFactory.getLogger(EmbeddingService.class);
    private static final int DEFAULT_VECTOR_DIMENSION = 1536;

    private final EmbeddingModel embeddingModel;

    public EmbeddingService(EmbeddingModel embeddingModel) {
        this.embeddingModel = embeddingModel;
    }

    public float[] embedText(String text) {
        String sanitized = StringUtils.hasText(text) ? text : "Thông tin chưa được cung cấp.";
        List<Double> output = embeddingModel.embed(sanitized);
        if (output == null || output.isEmpty()) {
            LOG.warn("Nhận được embedding rỗng, trả về vector mặc định.");
            return new float[DEFAULT_VECTOR_DIMENSION];
        }
        float[] vector = new float[output.size()];
        for (int i = 0; i < output.size(); i++) {
            vector[i] = output.get(i).floatValue();
        }
        return vector;
    }
}
