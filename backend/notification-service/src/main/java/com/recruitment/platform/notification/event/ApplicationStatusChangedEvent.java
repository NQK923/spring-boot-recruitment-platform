package com.recruitment.platform.notification.event;

import java.util.Map;

public record ApplicationStatusChangedEvent(
    Long applicationId,
    Long candidateId,
    Long jobPostingId,
    String jobTitle,
    String jobLocation,
    String oldStatus,
    String newStatus,
    Long changedByUserId,
    Map<String, Object> metadata
) {
}
