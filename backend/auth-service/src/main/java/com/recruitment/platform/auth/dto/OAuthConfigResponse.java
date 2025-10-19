package com.recruitment.platform.auth.dto;

public record OAuthConfigResponse(
        String googleClientId,
        String githubClientId,
        String githubRedirectUri,
        String githubAuthorizeRedirectUri
) {
}
