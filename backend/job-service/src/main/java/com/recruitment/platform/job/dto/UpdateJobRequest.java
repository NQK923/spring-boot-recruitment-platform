package com.recruitment.platform.job.dto;

public record UpdateJobRequest(
        String title,
        String description,
        String requirements,
        String benefits,
        String location,
        String workType,
        String status,
        Long positionId
) {
}
