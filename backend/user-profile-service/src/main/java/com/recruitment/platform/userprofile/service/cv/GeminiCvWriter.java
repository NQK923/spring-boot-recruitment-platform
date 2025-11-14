package com.recruitment.platform.userprofile.service.cv;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.recruitment.platform.common.exception.ServiceException;
import com.recruitment.platform.userprofile.config.GeminiProperties;
import com.recruitment.platform.userprofile.service.cv.model.CvDocument;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.util.Map;

@Component
public class GeminiCvWriter {

    private static final Logger LOG = LoggerFactory.getLogger(GeminiCvWriter.class);

    private final ObjectMapper objectMapper;
    private final ChatClient chatClient;

    public GeminiCvWriter(GeminiProperties properties,
                          ObjectMapper objectMapper,
                          ChatClient chatClient) {
        this.objectMapper = objectMapper;
        this.chatClient = chatClient;
        if (!StringUtils.hasText(properties.getApiKey())) {
            throw new ServiceException(HttpStatus.PRECONDITION_FAILED, "Chưa cấu hình GEMINI_API_KEY cho user-profile-service.");
        }
    }

    public CvDocument generateDocument(String prompt) {
        try {
            String text = chatClient.prompt(prompt)
                .call()
                .content();
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
        } catch (RuntimeException ex) {
            LOG.error("Gọi Gemini thất bại ngoài dự kiến.", ex);
            throw new ServiceException(HttpStatus.BAD_GATEWAY, "Gemini gặp lỗi khi tạo CV. Vui lòng thử lại sau.", null, Map.of(), ex);
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
}
