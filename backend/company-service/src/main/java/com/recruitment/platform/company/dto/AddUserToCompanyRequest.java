package com.recruitment.platform.company.dto;

public record AddUserToCompanyRequest(Long userId, Long companyId, String role) { }
