package com.recruitment.platform.company.dto;

import com.recruitment.platform.company.model.CompanyStatus;

public record UpdateCompanyRequest(
        String name,
        String description,
        String website,
        String logoUrl,
        String companySize,
        String companyAddress,
        CompanyStatus status
) {
}
