package com.recruitment.platform.job.dto;

// DTO for public job listings
public record JobPostingPublicDto(
        Long id,
        Long companyId,
        String companyName,
        String title,
        String description,
        String requirements,
        String benefits,
        String salaryRange,
        Integer hiringQuantity,
        Integer availableSlots,
        String location,
        String workType,
        String department,
        String level,
        String status
) {}
