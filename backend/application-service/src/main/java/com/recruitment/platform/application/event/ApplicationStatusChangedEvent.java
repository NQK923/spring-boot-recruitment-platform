package com.recruitment.platform.application.event;

import java.util.Map;

// Published when an application's status changes.
public record ApplicationStatusChangedEvent(
    Long applicationId,
    Long candidateId,
    Long jobPostingId,
    String oldStatus,
    String newStatus,
    Long changedByUserId,
    Map<String, Object> metadata
) {}
