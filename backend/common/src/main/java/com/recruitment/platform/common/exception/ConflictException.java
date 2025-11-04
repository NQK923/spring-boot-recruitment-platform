package com.recruitment.platform.common.exception;

import org.springframework.http.HttpStatus;

import java.util.Map;

public class ConflictException extends ServiceException {

    public ConflictException(String message) {
        super(HttpStatus.CONFLICT, message);
    }

    public ConflictException(String message, Map<String, Object> details) {
        super(HttpStatus.CONFLICT, message, null, details, null);
    }
}
