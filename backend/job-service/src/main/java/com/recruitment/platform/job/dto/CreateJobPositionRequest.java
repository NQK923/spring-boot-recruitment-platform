package com.recruitment.platform.job.dto;

public record CreateJobPositionRequest(
        String title,
        String department,
        String level
) {
}
