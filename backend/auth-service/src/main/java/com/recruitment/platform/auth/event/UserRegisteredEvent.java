package com.recruitment.platform.auth.event;

/**
 * DTO for the event published when a new user registers.
 */
public record UserRegisteredEvent(Long userId, String email, String verificationToken) {
}
