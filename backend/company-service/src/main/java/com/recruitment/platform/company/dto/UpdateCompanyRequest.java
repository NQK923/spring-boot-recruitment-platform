package com.recruitment.platform.company.dto;

public record UpdateCompanyRequest(
        String name,
        String description,
        String website,
        String logoUrl,
        String companySize,
        String companyAddress
) {
}
