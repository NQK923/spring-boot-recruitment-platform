package com.recruitment.platform.application.client.dto;

import java.util.Locale;

public record JobSummaryDto(Long id, Long companyId, String status) {

    public boolean isOpen() {
        if (status == null) {
            return false;
        }
        String normalized = status.trim().toUpperCase(Locale.ROOT);
        return normalized.equals("OPEN") || normalized.equals("PUBLISHED");
    }
}
