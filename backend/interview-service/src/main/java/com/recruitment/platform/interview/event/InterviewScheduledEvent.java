package com.recruitment.platform.interview.event;

import java.time.Instant;
import java.util.List;

public record InterviewScheduledEvent(
    Long interviewId,
    Long applicationId,
    Instant scheduleTime,
    String timezone,
    String locationOrLink,
    List<Long> participantUserIds // All user IDs including candidate and interviewers
) {
}
