package com.recruitment.platform.common.exception;

import org.springframework.http.HttpStatus;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * Canonical error payload returned by backend services.
 */
public record ApiError(
        OffsetDateTime timestamp,
        int status,
        String error,
        String message,
        String path,
        String traceId,
        Map<String, Object> details,
        List<ValidationError> violations
) {

    public ApiError {
        details = details == null ? Collections.emptyMap() : Collections.unmodifiableMap(details);
        violations = violations == null ? List.of() : List.copyOf(violations);
    }

    public static ApiError of(HttpStatus status,
                              String message,
                              String path,
                              String traceId,
                              Map<String, Object> details,
                              List<ValidationError> violations) {
        Objects.requireNonNull(status, "status must not be null");
        return new ApiError(
                OffsetDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                message,
                path,
                traceId,
                details,
                violations
        );
    }
}
