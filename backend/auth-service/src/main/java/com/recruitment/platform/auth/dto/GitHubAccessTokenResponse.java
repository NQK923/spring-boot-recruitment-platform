package com.recruitment.platform.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record GitHubAccessTokenResponse(
    @JsonProperty("access_token") String accessToken,
    @JsonProperty("token_type") String tokenType,
    String scope
) {
}
