package com.recruitment.platform.interview.dto;

import java.time.Instant;
import java.util.List;

public record InterviewResponse(
        Long id,
        Long applicationId,
        Instant scheduleTime,
        String timezone,
        String format,
        String locationOrLink,
        List<InterviewParticipantResponse> participants,
        List<InterviewFeedbackResponse> feedback,
        String outcome
) {
}
