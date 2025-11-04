package com.recruitment.platform.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record GitHubUserResponse(
    Long id,
    String login,
    String email,
    String name,
    @JsonProperty("avatar_url") String avatarUrl
) {
}
