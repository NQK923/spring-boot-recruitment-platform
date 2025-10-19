package com.recruitment.platform.interview.dto;

public record InterviewFeedbackResponse(
        Long interviewerId,
        Integer score,
        String comments,
        String outcome
) {
}
