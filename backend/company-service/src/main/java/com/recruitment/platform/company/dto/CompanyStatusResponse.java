package com.recruitment.platform.company.dto;

import com.recruitment.platform.company.model.CompanyStatus;

public record CompanyStatusResponse(
        Long companyId,
        CompanyStatus status
) {
}
