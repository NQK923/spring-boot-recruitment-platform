package com.recruitment.platform.userprofile.config;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;

@Getter
@Setter
@Validated
@ConfigurationProperties(prefix = "gemini")
public class GeminiProperties {

    @NotBlank
    private String apiKey;

    @NotBlank
    private String model;

    @NotBlank
    private String baseUrl = "https://generativelanguage.googleapis.com/v1beta";

    @PositiveOrZero
    private double temperature = 0.7;

    @PositiveOrZero
    private Integer topK = 40;

    @PositiveOrZero
    private Double topP = 0.9;

    @NotBlank
    private String promptVersion = "v1";

    public String modelName() {
        if (!StringUtils.hasText(model)) {
            return model;
        }
        return model.startsWith("models/") ? model.substring("models/".length()) : model;
    }
}
