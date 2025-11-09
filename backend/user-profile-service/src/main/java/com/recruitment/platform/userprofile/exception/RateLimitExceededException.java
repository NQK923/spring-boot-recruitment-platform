package com.recruitment.platform.userprofile.exception;

import com.recruitment.platform.common.exception.ServiceException;
import org.springframework.http.HttpStatus;

public class RateLimitExceededException extends ServiceException {
    public RateLimitExceededException(String message) {
        super(HttpStatus.TOO_MANY_REQUESTS, message);
    }
}
