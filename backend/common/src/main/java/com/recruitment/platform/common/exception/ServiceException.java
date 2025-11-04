package com.recruitment.platform.common.exception;

import org.springframework.http.HttpStatus;

import java.util.Collections;
import java.util.Map;
import java.util.Objects;

/**
 * Base class for domain/business exceptions that should be translated to consistent HTTP responses.
 */
public class ServiceException extends RuntimeException {

    private final HttpStatus status;
    private final String errorCode;
    private final Map<String, Object> details;

    public ServiceException(HttpStatus status, String message) {
        this(status, message, null, Collections.emptyMap(), null);
    }

    public ServiceException(HttpStatus status,
                            String message,
                            String errorCode,
                            Map<String, Object> details,
                            Throwable cause) {
        super(message, cause);
        this.status = Objects.requireNonNull(status, "status must not be null");
        this.errorCode = errorCode;
        this.details = details == null ? Collections.emptyMap() : Collections.unmodifiableMap(details);
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public Map<String, Object> getDetails() {
        return details;
    }
}
