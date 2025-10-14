package com.recruitment.platform.notification.event;

// This DTO represents the event payload
public record UserInvitedEvent(String email, String token, String roleToGrant) { }
