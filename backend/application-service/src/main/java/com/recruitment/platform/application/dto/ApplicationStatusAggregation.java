package com.recruitment.platform.application.dto;

import com.recruitment.platform.application.model.ApplicationStatus;

public record ApplicationStatusAggregation(ApplicationStatus status, long count) {
}
