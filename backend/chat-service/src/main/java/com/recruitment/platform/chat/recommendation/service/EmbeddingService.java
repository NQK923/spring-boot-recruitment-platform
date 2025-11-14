package com.recruitment.platform.chat.recommendation.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class EmbeddingService {

    private static final Logger LOG = LoggerFactory.getLogger(EmbeddingService.class);
    private static final int DEFAULT_VECTOR_DIMENSION = 3072;

    private final EmbeddingModel embeddingModel;

    public EmbeddingService(EmbeddingModel embeddingModel) {
        this.embeddingModel = embeddingModel;
    }

    public float[] embedText(String text) {
        String sanitized = StringUtils.hasText(text) ? text : "Thông tin chưa được cung cấp.";
        try {
            float[] vector = embeddingModel.embed(sanitized);
            if (vector == null || vector.length == 0) {
                LOG.warn("Nhận được embedding rỗng từ Gemini, trả về vector mặc định.");
                return new float[DEFAULT_VECTOR_DIMENSION];
            }
            return vector;
        } catch (Exception ex) {
            LOG.error("Gọi Gemini embedContent thất bại, trả về vector mặc định.", ex);
            return new float[DEFAULT_VECTOR_DIMENSION];
        }
    }
}
