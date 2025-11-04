package com.recruitment.platform.common.exception;

import org.springframework.http.HttpStatus;

import java.util.Map;

public class BadRequestException extends ServiceException {

    public BadRequestException(String message) {
        super(HttpStatus.BAD_REQUEST, message);
    }

    public BadRequestException(String message, Map<String, Object> details) {
        super(HttpStatus.BAD_REQUEST, message, null, details, null);
    }
}
