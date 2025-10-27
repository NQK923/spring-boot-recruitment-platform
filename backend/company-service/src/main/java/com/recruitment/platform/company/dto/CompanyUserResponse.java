package com.recruitment.platform.company.dto;

public record CompanyUserResponse(Long userId, String email, String role, boolean locked) {
}
