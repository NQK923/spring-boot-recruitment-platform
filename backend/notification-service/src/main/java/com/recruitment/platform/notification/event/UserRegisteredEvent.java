package com.recruitment.platform.notification.event;

public record UserRegisteredEvent(Long userId, String email) {
}
