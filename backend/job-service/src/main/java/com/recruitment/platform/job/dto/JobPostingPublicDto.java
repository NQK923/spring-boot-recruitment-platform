package com.recruitment.platform.job.dto;

// DTO for public job listings
public record JobPostingPublicDto(
        Long id,
        Long companyId,
        String title,
        String description,
        String requirements,
        String benefits,
        String location,
        String workType,
        String department,
        String level,
        String status
) {}
