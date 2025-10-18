package com.recruitment.platform.auth.dto;

import java.time.Instant;

/**
 * Standard API error payload returned by the Auth Service.
 */
public record ErrorResponse(String message, int status, Instant timestamp) {

    public static ErrorResponse of(String message, int status) {
        return new ErrorResponse(message, status, Instant.now());
    }
}

