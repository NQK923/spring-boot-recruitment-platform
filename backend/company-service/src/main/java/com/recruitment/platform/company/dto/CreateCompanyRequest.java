package com.recruitment.platform.company.dto;

public record CreateCompanyRequest(
        String name,
        String description,
        String website,
        String logoUrl,
        String companySize,
        String companyAddress
) {
}
