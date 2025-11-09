package com.recruitment.platform.job.dto;

// DTO for creating a new job posting
public record CreateJobRequest(
    String title,
    String description,
    String requirements,
    String salaryRange,
    String benefits,
    String location,
    String workType,
    Long positionId,
    Integer hiringQuantity
    // recruiterId will be set from JWT, companyId from header
) {}
