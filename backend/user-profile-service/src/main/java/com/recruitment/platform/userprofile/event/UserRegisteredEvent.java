package com.recruitment.platform.userprofile.event;

/**
 * DTO for the event consumed when a new user registers.
 */
public record UserRegisteredEvent(Long userId, String email, String verificationToken) {
}
