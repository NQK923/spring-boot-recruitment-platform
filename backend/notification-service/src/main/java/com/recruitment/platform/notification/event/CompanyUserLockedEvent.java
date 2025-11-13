package com.recruitment.platform.notification.event;

import java.time.Instant;

public record CompanyUserLockedEvent(
        Long companyId,
        String companyName,
        Long userId,
        boolean locked,
        Instant occurredAt
) {
}
