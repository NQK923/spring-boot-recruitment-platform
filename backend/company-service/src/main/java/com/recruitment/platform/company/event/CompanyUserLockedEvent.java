package com.recruitment.platform.company.event;

import java.time.Instant;

public record CompanyUserLockedEvent(
        Long companyId,
        String companyName,
        Long userId,
        boolean locked,
        Instant occurredAt
) {
}
