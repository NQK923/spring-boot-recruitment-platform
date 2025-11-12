package com.recruitment.platform.application.dto;

public record ApplicationSummaryDto(
        Long applicationId,
        Long candidateId,
        Long jobPostingId,
        String jobTitle,
        String jobLocation
) {
}
