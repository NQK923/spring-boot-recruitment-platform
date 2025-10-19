package com.recruitment.platform.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ResendEmailOtpRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Email is not valid")
        String email
) {
}
