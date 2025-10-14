package com.recruitment.platform.job.dto;

// DTO for public job listings
public record JobPostingPublicDto(
    Long id,
    String title,
    String description
    // Add other fields safe for public view, e.g., companyName, location
) {}
