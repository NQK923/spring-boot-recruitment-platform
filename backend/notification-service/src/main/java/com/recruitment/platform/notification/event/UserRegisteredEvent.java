package com.recruitment.platform.notification.event;

import java.time.Instant;

public record UserRegisteredEvent(Long userId, String email, String verificationCode, Instant expiresAt) {
}
