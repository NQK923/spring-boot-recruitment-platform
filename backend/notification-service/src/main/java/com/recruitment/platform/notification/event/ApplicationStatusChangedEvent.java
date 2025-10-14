package com.recruitment.platform.notification.event;

public record ApplicationStatusChangedEvent(
    Long applicationId,
    Long candidateId,
    Long jobPostingId,
    String oldStatus,
    String newStatus,
    Long changedByUserId
) {
}
