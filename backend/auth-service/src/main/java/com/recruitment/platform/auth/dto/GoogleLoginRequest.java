package com.recruitment.platform.auth.dto;

import org.springframework.util.StringUtils;

public record GoogleLoginRequest(String idToken, String code, String redirectUri) {

    public boolean hasIdToken() {
        return StringUtils.hasText(idToken);
    }

    public boolean hasAuthorizationCode() {
        return StringUtils.hasText(code);
    }

    public String normalizedRedirectUri() {
        return StringUtils.hasText(redirectUri) ? redirectUri : null;
    }
}
