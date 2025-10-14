package com.recruitment.platform.application.event;

// Published when an application's status changes.
public record ApplicationStatusChangedEvent(
    Long applicationId,
    Long candidateId,
    Long jobPostingId,
    String oldStatus,
    String newStatus,
    Long changedByUserId // Can be null if changed by the system
) {}
