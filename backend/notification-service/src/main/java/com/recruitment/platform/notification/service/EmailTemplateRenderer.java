package com.recruitment.platform.notification.service;

import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.StringWriter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class EmailTemplateRenderer {

    private final Configuration freemarkerConfiguration;
    private final String brandName;
    private final String supportEmail;

    public EmailTemplateRenderer(Configuration freemarkerConfiguration,
                                 @Value("${app.brand-name:TalentFlow}") String brandName,
                                 @Value("${app.support-email:support@talentflow.app}") String supportEmail) {
        this.freemarkerConfiguration = freemarkerConfiguration;
        this.brandName = (brandName == null || brandName.isBlank()) ? "TalentFlow" : brandName;
        this.supportEmail = (supportEmail == null || supportEmail.isBlank()) ? "support@talentflow.app" : supportEmail;
    }

    public String render(String headline,
                         List<String> paragraphs,
                         String actionLabel,
                         String actionUrl,
                         String closingNote) {
        Map<String, Object> model = new HashMap<>();
        model.put("headline", headline == null || headline.isBlank() ? "Thông tin cập nhật" : headline.trim());
        model.put("paragraphs", sanitizeParagraphs(paragraphs));
        model.put("actionLabel", sanitize(actionLabel));
        model.put("actionUrl", sanitize(actionUrl));
        model.put("closingNote", closingNote == null || closingNote.isBlank() ? defaultClosing() : closingNote.trim());
        model.put("brandName", brandName);
        model.put("supportEmail", supportEmail);

        try {
            Template template = freemarkerConfiguration.getTemplate("email/base.ftl", "UTF-8");
            try (StringWriter writer = new StringWriter()) {
                template.process(model, writer);
                return writer.toString();
            }
        } catch (IOException | TemplateException ex) {
            throw new IllegalStateException("Unable to render email template", ex);
        }
    }

    public String getBrandName() {
        return brandName;
    }

    public String getSupportEmail() {
        return supportEmail;
    }

    private List<String> sanitizeParagraphs(List<String> paragraphs) {
        if (paragraphs == null || paragraphs.isEmpty()) {
            return List.of();
        }
        return paragraphs.stream()
                .filter(p -> p != null && !p.isBlank())
                .map(String::trim)
                .collect(Collectors.toList());
    }

    private String sanitize(String value) {
        return value == null ? null : value.trim();
    }

    private String defaultClosing() {
        return "Nếu bạn cần hỗ trợ thêm, vui lòng phản hồi email này để được đội ngũ " + brandName + " hỗ trợ.";
    }
}
