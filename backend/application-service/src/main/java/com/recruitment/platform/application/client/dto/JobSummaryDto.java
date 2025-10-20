package com.recruitment.platform.application.client.dto;

public record JobSummaryDto(Long id, Long companyId, String status) {

    public boolean isOpen() {
        return "OPEN".equalsIgnoreCase(status);
    }
}
