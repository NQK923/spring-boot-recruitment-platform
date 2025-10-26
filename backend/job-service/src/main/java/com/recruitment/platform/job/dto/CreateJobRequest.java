package com.recruitment.platform.job.dto;

// DTO for creating a new job posting
public record CreateJobRequest(
    String title,
    String description,
    String requirements,
    String benefits,
    String location,
    String workType,
    Long positionId
    // recruiterId will be set from JWT, companyId from header
) {}
