package com.recruitment.platform.userprofile.service.cv;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.genai.Chat;
import com.google.genai.Client;
import com.google.genai.errors.ClientException;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;
import com.recruitment.platform.common.exception.ServiceException;
import com.recruitment.platform.userprofile.config.GeminiProperties;
import com.recruitment.platform.userprofile.service.cv.model.CvDocument;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.util.Map;

@Component
public class GeminiCvWriter {

    private static final Logger LOG = LoggerFactory.getLogger(GeminiCvWriter.class);

    private final ObjectMapper objectMapper;
    private final GeminiProperties properties;
    private final Client client;
    private final GenerateContentConfig baseConfig;

    public GeminiCvWriter(GeminiProperties properties, ObjectMapper objectMapper) {
        this.properties = properties;
        this.objectMapper = objectMapper;
        if (!StringUtils.hasText(properties.getApiKey())) {
            throw new ServiceException(HttpStatus.PRECONDITION_FAILED, "Chưa cấu hình GEMINI_API_KEY cho user-profile-service.");
        }
        this.client = Client.builder()
                .apiKey(properties.getApiKey())
                .build();
        this.baseConfig = buildGenerationConfig();
    }

    public CvDocument generateDocument(String prompt) {
        try {
            Chat chat = client.chats.create(properties.modelName(), baseConfig);
            Content content = Content.builder()
                    .role("user")
                    .parts(Part.fromText(prompt))
                    .build();
            GenerateContentResponse response = chat.sendMessage(content);
            response.checkFinishReason();
            String text = response.text();
            if (!StringUtils.hasText(text)) {
                throw new ServiceException(HttpStatus.UNPROCESSABLE_ENTITY, "Gemini không trả về nội dung CV hợp lệ.");
            }
            String clean = sanitize(text);
            CvDocument document = objectMapper.readValue(clean, CvDocument.class);
            if (document.getLinks() == null) {
                document.setLinks(new CvDocument.Links());
            }
            return document;
        } catch (IOException ex) {
            LOG.error("Gemini trả về JSON không hợp lệ.", ex);
            throw new ServiceException(HttpStatus.UNPROCESSABLE_ENTITY, "Không thể phân tích kết quả từ Gemini.", null, Map.of(), ex);
        } catch (ClientException ex) {
            LOG.error("Gemini trả lỗi client: {}", ex.getMessage());
            throw new ServiceException(HttpStatus.BAD_GATEWAY, "Gemini gặp lỗi khi tạo CV. Vui lòng thử lại sau.", null, Map.of(), ex);
        } catch (RuntimeException ex) {
            LOG.error("Gọi Gemini thất bại ngoài dự kiến.", ex);
            throw new ServiceException(HttpStatus.BAD_GATEWAY, "Gemini gặp lỗi khi tạo CV. Vui lòng thử lại sau.", null, Map.of(), ex);
        }
    }

    @PreDestroy
    public void shutdown() {
        try {
            client.close();
        } catch (Exception ex) {
            LOG.warn("Không thể đóng kết nối Gemini an toàn: {}", ex.getMessage());
        }
    }

    private String sanitize(String text) {
        String trimmed = text.trim();
        if (trimmed.startsWith("```")) {
            int firstBreak = trimmed.indexOf('\n');
            if (firstBreak > -1) {
                trimmed = trimmed.substring(firstBreak + 1);
            }
        }
        if (trimmed.endsWith("```")) {
            trimmed = trimmed.substring(0, trimmed.lastIndexOf("```"));
        }
        return trimmed.trim();
    }

    private GenerateContentConfig buildGenerationConfig() {
        GenerateContentConfig.Builder builder = GenerateContentConfig.builder();
        builder.temperature((float) properties.getTemperature());
        if (properties.getTopK() != null) {
            builder.topK(properties.getTopK().floatValue());
        }
        if (properties.getTopP() != null) {
            builder.topP(properties.getTopP().floatValue());
        }
        return builder.build();
    }
}
