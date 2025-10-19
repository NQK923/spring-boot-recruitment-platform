package com.recruitment.platform.auth.event;

import java.time.Instant;

/**
 * DTO for the event published when a new user registers.
 */
public record UserRegisteredEvent(Long userId, String email, String verificationCode, Instant expiresAt) {
}
