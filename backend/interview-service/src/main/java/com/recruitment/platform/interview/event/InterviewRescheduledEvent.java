package com.recruitment.platform.interview.event;

import java.time.Instant;
import java.util.List;

public record InterviewRescheduledEvent(
    Long interviewId,
    Long applicationId,
    Instant newScheduleTime,
    String timezone,
    String locationOrLink,
    List<Long> participantUserIds,
    String jobTitle,
    String jobLocation
) {
}
