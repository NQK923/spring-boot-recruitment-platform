package com.recruitment.platform.chat.prompt;

import com.recruitment.platform.chat.config.GeminiProperties;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Component
public class SystemPromptProvider {

    private final String renderedPrompt;

    public SystemPromptProvider(GeminiProperties properties, ResourceLoader resourceLoader) throws IOException {
        Resource resource = resourceLoader.getResource(properties.getSystemPromptPath());
        if (!resource.exists()) {
            throw new IllegalStateException("System prompt file not found: " + properties.getSystemPromptPath());
        }
        String template = StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
        this.renderedPrompt = applyPlaceholders(template, Map.of(
            "{{companyName}}", properties.getCompanyName(),
            "{{careersURL}}", properties.getCareersUrl(),
            "{{candidatePortalURL}}", properties.getCandidatePortalUrl(),
            "{{policyURL}}", properties.getPolicyUrl(),
            "{{privacyURL}}", properties.getPrivacyUrl(),
            "{{publicHRMailbox}}", properties.getPublicHrMailbox()
        ));
    }

    public String getPrompt() {
        return renderedPrompt;
    }

    private String applyPlaceholders(String template, Map<String, String> replacements) {
        String result = template;
        for (Map.Entry<String, String> entry : replacements.entrySet()) {
            result = result.replace(entry.getKey(), entry.getValue());
        }
        return result;
    }
}
