package com.recruitment.platform.auth.event;

import java.time.Instant;

public record PasswordResetRequestedEvent(Long userId, String email, String otp, Instant expiresAt) {
}
