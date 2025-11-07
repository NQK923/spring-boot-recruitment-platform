package com.recruitment.platform.chat.recommendation.model;

import java.util.UUID;

public record JobSuggestion(
    UUID jobId,
    String title,
    String companyName,
    String location,
    String workType,
    String url,
    String reason,
    double score
) {
}
