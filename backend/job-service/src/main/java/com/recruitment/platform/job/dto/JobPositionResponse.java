package com.recruitment.platform.job.dto;

public record JobPositionResponse(
        Long id,
        String title,
        String department,
        String level
) {
}
