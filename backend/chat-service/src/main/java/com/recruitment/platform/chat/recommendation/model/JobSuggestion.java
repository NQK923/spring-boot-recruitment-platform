package com.recruitment.platform.chat.recommendation.model;

public record JobSuggestion(
    Long jobId,
    String title,
    String companyName,
    String location,
    String workType,
    String url,
    String reason,
    double score
) {
}
