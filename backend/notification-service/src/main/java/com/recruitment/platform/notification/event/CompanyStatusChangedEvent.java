package com.recruitment.platform.notification.event;

import java.time.Instant;
import java.util.List;

public record CompanyStatusChangedEvent(
        Long companyId,
        String companyName,
        String previousStatus,
        String newStatus,
        List<Long> adminUserIds,
        Instant occurredAt
) {
}
