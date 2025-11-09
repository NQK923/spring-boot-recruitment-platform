package com.recruitment.platform.userprofile.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record EducationRequest(
        String school,
        String degree,
        String major,
        String gpa,
        String honors,
        String activities,
        String startDate,
        String endDate
) {}
