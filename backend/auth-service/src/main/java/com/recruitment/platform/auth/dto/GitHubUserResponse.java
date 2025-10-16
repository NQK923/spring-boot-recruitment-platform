package com.recruitment.platform.auth.dto;

public record GitHubUserResponse(
    Long id,
    String login,
    String email
) {
}
