package com.recruitment.platform.company.dto;

public record UpdateCompanyUserRequest(
        String role,
        Boolean locked
) {
}
