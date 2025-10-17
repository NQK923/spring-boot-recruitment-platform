package com.recruitment.platform.job.dto;

public record UpdateJobRequest(
        String title,
        String description,
        String requirements,
        String location,
        String workType,
        String status,
        Long positionId
) {
}
