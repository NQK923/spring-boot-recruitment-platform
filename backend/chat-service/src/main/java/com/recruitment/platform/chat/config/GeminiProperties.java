package com.recruitment.platform.chat.config;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Setter
@Getter
@Validated
@ConfigurationProperties(prefix = "gemini")
public class GeminiProperties {

    @NotBlank
    private String apiKey;

    @NotBlank
    private String model;

    @NotBlank
    private String baseUrl;

    @Min(0)
    @Max(1)
    private double temperature = 0.3;

    @Min(0)
    @Max(1)
    private double topP = 0.9;

    @Positive
    private int maxTokens = 400;

    private String systemPromptPath = "classpath:prompts/system.txt";

    @NotBlank
    private String companyName;

    @NotBlank
    private String careersUrl;

    @NotBlank
    private String candidatePortalUrl;

    @NotBlank
    private String policyUrl;

    @NotBlank
    private String privacyUrl;

    @NotBlank
    private String publicHrMailbox;

}
