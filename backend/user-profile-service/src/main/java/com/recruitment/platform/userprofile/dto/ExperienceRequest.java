package com.recruitment.platform.userprofile.dto;

public record ExperienceRequest(
    String title,
    String companyName,
    String description,
    String startDate,
    String endDate
) {}
