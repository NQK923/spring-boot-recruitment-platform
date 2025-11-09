package com.recruitment.platform.userprofile.config;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Getter
@Setter
@Validated
@ConfigurationProperties(prefix = "cv")
public class CvProperties {

    private final DefaultSettings defaults = new DefaultSettings();
    private final PdfSettings pdf = new PdfSettings();

    @Getter
    @Setter
    public static class DefaultSettings {
        @NotBlank
        private String template = "modern-1";
        @NotBlank
        private String language = "vi";
        @NotBlank
        private String tone = "neutral";
    }

    @Getter
    @Setter
    public static class PdfSettings {
        @NotBlank
        private String fontPath;
    }
}
