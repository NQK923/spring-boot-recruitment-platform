package com.recruitment.platform.company.client.dto;

// This DTO must match the one in Auth Service
public record InternalInviteRequest(String email, String roleToGrant, Long companyId) { }
