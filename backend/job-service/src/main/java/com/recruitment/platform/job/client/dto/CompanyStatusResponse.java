package com.recruitment.platform.job.client.dto;

public record CompanyStatusResponse(
        Long companyId,
        String status,
        String companyName
) {
}
