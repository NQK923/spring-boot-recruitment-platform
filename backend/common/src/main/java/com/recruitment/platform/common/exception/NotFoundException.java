package com.recruitment.platform.common.exception;

import org.springframework.http.HttpStatus;

import java.util.Map;

public class NotFoundException extends ServiceException {

    public NotFoundException(String message) {
        super(HttpStatus.NOT_FOUND, message);
    }

    public NotFoundException(String message, Map<String, Object> details) {
        super(HttpStatus.NOT_FOUND, message, null, details, null);
    }
}
