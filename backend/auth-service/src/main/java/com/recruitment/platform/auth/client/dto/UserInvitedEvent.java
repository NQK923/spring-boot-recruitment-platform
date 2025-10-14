package com.recruitment.platform.auth.client.dto;

public record UserInvitedEvent(String email, String token, String roleToGrant) { }
