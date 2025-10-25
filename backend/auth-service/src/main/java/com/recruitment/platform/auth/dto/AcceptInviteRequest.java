package com.recruitment.platform.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record AcceptInviteRequest(
        @NotBlank(message = "Invitation token is required.")
        String token,
        @NotBlank(message = "Password is required.")
        String password
) { }
