package com.recruitment.platform.company.event;

import com.recruitment.platform.company.model.CompanyStatus;

import java.time.Instant;
import java.util.List;

public record CompanyStatusChangedEvent(
        Long companyId,
        String companyName,
        CompanyStatus previousStatus,
        CompanyStatus newStatus,
        List<Long> adminUserIds,
        Instant occurredAt
) {
}
