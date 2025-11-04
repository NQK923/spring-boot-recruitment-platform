package com.recruitment.platform.chat.exception;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.recruitment.platform.common.exception.ValidationError;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.springframework.boot.web.error.ErrorAttributeOptions;
import org.springframework.boot.web.reactive.error.DefaultErrorAttributes;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.support.WebExchangeBindException;
import org.springframework.web.reactive.function.server.ServerRequest;
import org.springframework.web.server.ResponseStatusException;

/**
 * Custom error attributes tuned for the chat service. Produces a map compatible with ApiError.
 */
public class ChatErrorAttributes extends DefaultErrorAttributes {

    @Override
    public Map<String, Object> getErrorAttributes(ServerRequest request, ErrorAttributeOptions options) {
        Throwable error = getError(request);
        Map<String, Object> base = new LinkedHashMap<>();

        HttpStatus status = resolveStatus(error);
        base.put("status", status.value());
        base.put("error", status.getReasonPhrase());
        base.put("message", resolveMessage(error, status));
        base.put("path", request.path());
        base.put("details", resolveDetails(error));
        base.put("violations", resolveViolations(error));

        return base;
    }

    private HttpStatus resolveStatus(Throwable error) {
        if (error instanceof ResponseStatusException responseStatusException) {
            HttpStatus resolved = HttpStatus.resolve(responseStatusException.getStatusCode().value());
            return resolved != null ? resolved : HttpStatus.INTERNAL_SERVER_ERROR;
        }
        if (error instanceof ConstraintViolationException || error instanceof IllegalArgumentException) {
            return HttpStatus.BAD_REQUEST;
        }
        if (error instanceof IllegalStateException) {
            return HttpStatus.CONFLICT;
        }
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }

    private String resolveMessage(Throwable error, HttpStatus status) {
        if (error instanceof ResponseStatusException responseStatusException) {
            return responseStatusException.getReason() != null
                ? responseStatusException.getReason()
                : status.getReasonPhrase();
        }
        if (error instanceof ConstraintViolationException) {
            return "Validation failed";
        }
        if (error instanceof IllegalArgumentException illegalArgumentException) {
            return illegalArgumentException.getMessage();
        }
        if (error instanceof IllegalStateException illegalStateException) {
            return illegalStateException.getMessage();
        }
        return status.getReasonPhrase();
    }

    private Map<String, Object> resolveDetails(Throwable error) {
        if (error instanceof ResponseStatusException responseStatusException) {
            return Map.of("code", responseStatusException.getBody());
        }
        return Map.of();
    }

    private List<ValidationError> resolveViolations(Throwable error) {
        if (error instanceof ConstraintViolationException constraintViolationException) {
            return constraintViolationException.getConstraintViolations().stream()
                .map(this::toValidationError)
                .toList();
        }
        if (error instanceof WebExchangeBindException bindException) {
            return bindException.getFieldErrors().stream()
                .map(fieldError -> new ValidationError(
                    fieldError.getField(),
                    fieldError.getDefaultMessage(),
                    fieldError.getRejectedValue()))
                .toList();
        }
        return List.of();
    }

    private ValidationError toValidationError(ConstraintViolation<?> violation) {
        String field = violation.getPropertyPath() != null ? violation.getPropertyPath().toString() : null;
        return new ValidationError(field, violation.getMessage(), violation.getInvalidValue());
    }
}
