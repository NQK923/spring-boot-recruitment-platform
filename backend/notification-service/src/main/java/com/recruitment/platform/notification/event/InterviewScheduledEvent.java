package com.recruitment.platform.notification.event;

import java.time.Instant;
import java.util.List;

public record InterviewScheduledEvent(
    Long interviewId,
    Long applicationId,
    Instant scheduleTime,
    String timezone,
    String locationOrLink,
    List<Long> participantUserIds
) {
}
