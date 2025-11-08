package com.recruitment.platform.chat.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

@Setter
@Getter
@Validated
@ConfigurationProperties(prefix = "app.recommend")
public class RecommendationProperties {

    @Min(1)
    private int topK = 50;

    @Min(1)
    private int finalK = 5;

    @Positive
    @Max(180)
    private int freshnessDays = 21;

    @Positive
    private int bootstrapSize = 50;

    @NotBlank
    private String jobDetailBaseUrl = "http://localhost:3000/jobs";

}
