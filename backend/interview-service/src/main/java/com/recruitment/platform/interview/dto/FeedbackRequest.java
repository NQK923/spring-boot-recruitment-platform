package com.recruitment.platform.interview.dto;

public record FeedbackRequest(
        Integer score,
        String outcome,
        String comments
) {
}
