package com.recruitment.platform.notification.event;

import java.util.Map;

public record ApplicationStatusChangedEvent(
    Long applicationId,
    Long candidateId,
    Long jobPostingId,
    String oldStatus,
    String newStatus,
    Long changedByUserId,
    Map<String, Object> metadata
) {
}
