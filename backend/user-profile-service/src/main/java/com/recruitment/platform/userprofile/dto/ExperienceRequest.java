package com.recruitment.platform.userprofile.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.recruitment.platform.userprofile.model.EmploymentType;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ExperienceRequest(
        String title,
        String companyName,
        String description,
        String startDate,
        String endDate,
        String location,
        EmploymentType employmentType,
        Boolean isCurrent,
        String achievements,
        List<String> techStack
) {}
