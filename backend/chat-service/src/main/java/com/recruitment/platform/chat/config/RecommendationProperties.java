package com.recruitment.platform.chat.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;

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

    public int getTopK() {
        return topK;
    }

    public void setTopK(int topK) {
        this.topK = topK;
    }

    public int getFinalK() {
        return finalK;
    }

    public void setFinalK(int finalK) {
        this.finalK = finalK;
    }

    public int getFreshnessDays() {
        return freshnessDays;
    }

    public void setFreshnessDays(int freshnessDays) {
        this.freshnessDays = freshnessDays;
    }

    public int getBootstrapSize() {
        return bootstrapSize;
    }

    public void setBootstrapSize(int bootstrapSize) {
        this.bootstrapSize = bootstrapSize;
    }
}
