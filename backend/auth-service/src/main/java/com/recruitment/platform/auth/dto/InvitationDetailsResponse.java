package com.recruitment.platform.auth.dto;

import java.time.Instant;

public record InvitationDetailsResponse(
        String email,
        String roleToGrant,
        Long companyId,
        Instant expiresAt
) {
}

