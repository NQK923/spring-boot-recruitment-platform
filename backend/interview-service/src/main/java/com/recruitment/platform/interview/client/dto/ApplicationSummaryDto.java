package com.recruitment.platform.interview.client.dto;

public record ApplicationSummaryDto(
        Long applicationId,
        Long candidateId,
        Long jobPostingId,
        String jobTitle,
        String jobLocation
) {
}
