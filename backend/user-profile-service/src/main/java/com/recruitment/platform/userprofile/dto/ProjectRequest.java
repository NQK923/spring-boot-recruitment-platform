package com.recruitment.platform.userprofile.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ProjectRequest(
        String name,
        String role,
        String summary,
        String responsibilities,
        String achievements,
        List<String> techStack,
        String projectUrl,
        String repoUrl,
        String startDate,
        String endDate,
        Boolean isCurrent
) {}
