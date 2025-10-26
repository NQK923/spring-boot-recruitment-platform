package com.recruitment.platform.company.dto;

public final class PublicCompanyResponses {
    private PublicCompanyResponses() { }

    public record Summary(Long id, String name) { }

    public record Profile(
            Long id,
            String name,
            String description,
            String website,
            String logoUrl,
            String companySize,
            String companyAddress
    ) { }
}
