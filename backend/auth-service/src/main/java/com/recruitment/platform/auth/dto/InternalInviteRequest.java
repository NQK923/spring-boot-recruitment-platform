package com.recruitment.platform.auth.dto;

public record InternalInviteRequest(String email, String roleToGrant, Long companyId, Long createdByUserId) { }
