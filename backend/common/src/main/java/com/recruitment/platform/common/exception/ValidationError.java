package com.recruitment.platform.common.exception;

/**
 * Describes a single validation violation.
 */
public record ValidationError(
        String field,
        String message,
        Object rejectedValue
) {
}
