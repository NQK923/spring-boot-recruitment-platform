package com.recruitment.platform.userprofile.dto;

public record EducationRequest(
    String school,
    String degree,
    String startDate,
    String endDate
) {}
