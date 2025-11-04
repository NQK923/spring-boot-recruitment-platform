package com.recruitment.platform.common.exception;

import feign.FeignException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

@Order(Ordered.HIGHEST_PRECEDENCE)
@ControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ServiceException.class)
    protected ResponseEntity<Object> handleServiceException(ServiceException ex, WebRequest request) {
        Map<String, Object> details = new LinkedHashMap<>(ex.getDetails());
        if (StringUtils.hasText(ex.getErrorCode())) {
            details.putIfAbsent("code", ex.getErrorCode());
        }
        return buildResponse(ex.getStatus(), ex.getMessage(), request, details, List.of(), ex);
    }

    @ExceptionHandler(ResponseStatusException.class)
    protected ResponseEntity<Object> handleResponseStatusException(ResponseStatusException ex, WebRequest request) {
        HttpStatus status = HttpStatus.resolve(ex.getStatusCode().value());
        if (status == null) {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
        }
        return buildResponse(status, ex.getReason(), request, Map.of(), List.of(), ex);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    protected ResponseEntity<Object> handleConstraintViolation(ConstraintViolationException ex, WebRequest request) {
        List<ValidationError> violations = ex.getConstraintViolations().stream()
                .map(this::toValidationError)
                .toList();
        return buildResponse(HttpStatus.BAD_REQUEST, "Validation failed", request, Map.of(), violations, ex);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    protected ResponseEntity<Object> handleTypeMismatch(MethodArgumentTypeMismatchException ex, WebRequest request) {
        String message = String.format(Locale.ENGLISH,
                "Parameter '%s' with value '%s' could not be converted to required type '%s'",
                ex.getName(),
                ex.getValue(),
                ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown");
        return buildResponse(HttpStatus.BAD_REQUEST, message, request, Map.of(), List.of(), ex);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    protected ResponseEntity<Object> handleIllegalArgument(IllegalArgumentException ex, WebRequest request) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request, Map.of(), List.of(), ex);
    }

    @ExceptionHandler(IllegalStateException.class)
    protected ResponseEntity<Object> handleIllegalState(IllegalStateException ex, WebRequest request) {
        return buildResponse(HttpStatus.CONFLICT, ex.getMessage(), request, Map.of(), List.of(), ex);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    protected ResponseEntity<Object> handleDataIntegrityViolation(DataIntegrityViolationException ex, WebRequest request) {
        return buildResponse(HttpStatus.CONFLICT, "Operation violates data integrity constraints.", request, Map.of(), List.of(), ex);
    }

    @ExceptionHandler(EntityNotFoundException.class)
    protected ResponseEntity<Object> handleEntityNotFound(EntityNotFoundException ex, WebRequest request) {
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), request, Map.of(), List.of(), ex);
    }

    @ExceptionHandler(AuthenticationException.class)
    protected ResponseEntity<Object> handleAuthentication(AuthenticationException ex, WebRequest request) {
        return buildResponse(HttpStatus.UNAUTHORIZED, ex.getMessage(), request, Map.of(), List.of(), ex);
    }

    @ExceptionHandler(AccessDeniedException.class)
    protected ResponseEntity<Object> handleAccessDenied(AccessDeniedException ex, WebRequest request) {
        return buildResponse(HttpStatus.FORBIDDEN, ex.getMessage(), request, Map.of(), List.of(), ex);
    }

    @ExceptionHandler(FeignException.class)
    protected ResponseEntity<Object> handleFeign(FeignException ex, WebRequest request) {
        HttpStatus status = HttpStatus.resolve(ex.status());
        if (status == null) {
            status = HttpStatus.SERVICE_UNAVAILABLE;
        }
        Map<String, Object> details = new LinkedHashMap<>();
        details.put("target", ex.request().url());
        if (!CollectionUtils.isEmpty(ex.responseHeaders())) {
            details.put("upstreamResponseHeaders", ex.responseHeaders());
        }
        return buildResponse(status, "Upstream service call failed.", request, details, List.of(), ex);
    }

    @ExceptionHandler(Exception.class)
    protected ResponseEntity<Object> handleUnhandled(Exception ex, WebRequest request) {
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected server error.", request, Map.of(), List.of(), ex);
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex,
                                                                  HttpHeaders headers,
                                                                  HttpStatusCode status,
                                                                  WebRequest request) {
        List<ValidationError> violations = new ArrayList<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            violations.add(new ValidationError(
                    fieldError.getField(),
                    fieldError.getDefaultMessage(),
                    fieldError.getRejectedValue()
            ));
        }
        String message = "Request contains invalid fields.";
        return buildResponse(HttpStatus.BAD_REQUEST, message, request, Map.of(), violations, ex);
    }

    @Override
    protected ResponseEntity<Object> handleMissingServletRequestParameter(MissingServletRequestParameterException ex,
                                                                          HttpHeaders headers,
                                                                          HttpStatusCode status,
                                                                          WebRequest request) {
        String message = String.format(Locale.ENGLISH, "Missing required parameter '%s'", ex.getParameterName());
        return buildResponse(HttpStatus.BAD_REQUEST, message, request, Map.of(), List.of(), ex);
    }

    @Override
    protected ResponseEntity<Object> handleHttpMessageNotReadable(HttpMessageNotReadableException ex,
                                                                  HttpHeaders headers,
                                                                  HttpStatusCode status,
                                                                  WebRequest request) {
        return buildResponse(HttpStatus.BAD_REQUEST, "Request body is invalid or unreadable.", request, Map.of(), List.of(), ex);
    }

    private ValidationError toValidationError(ConstraintViolation<?> violation) {
        String field = violation.getPropertyPath() != null ? violation.getPropertyPath().toString() : null;
        return new ValidationError(field, violation.getMessage(), violation.getInvalidValue());
    }

    private ResponseEntity<Object> buildResponse(HttpStatus status,
                                                 String message,
                                                 WebRequest request,
                                                 Map<String, Object> details,
                                                 List<ValidationError> violations,
                                                 Throwable ex) {
        String path = resolvePath(request);
        String traceId = resolveTraceId();
        String errorMessage = StringUtils.hasText(message) ? message : status.getReasonPhrase();

        ApiError body = ApiError.of(status, errorMessage, path, traceId, details, violations);

        if (status.is5xxServerError()) {
            log.error("Unhandled exception at path {}: {}", path, errorMessage, ex);
        } else {
            log.warn("Handled {} for path {}: {}", status.value(), path, errorMessage);
        }

        return ResponseEntity.status(status).body(body);
    }

    private String resolveTraceId() {
        String traceId = MDC.get("traceId");
        if (!StringUtils.hasText(traceId)) {
            traceId = MDC.get("X-B3-TraceId");
        }
        return traceId;
    }

    private String resolvePath(WebRequest request) {
        if (request instanceof ServletWebRequest servletWebRequest) {
            return servletWebRequest.getRequest().getRequestURI();
        }
        return "";
    }
}
