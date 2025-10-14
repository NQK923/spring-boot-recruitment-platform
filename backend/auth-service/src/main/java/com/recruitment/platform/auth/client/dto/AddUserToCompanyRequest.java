package com.recruitment.platform.auth.client.dto;

public record AddUserToCompanyRequest(Long userId, Long companyId, String role) { }
