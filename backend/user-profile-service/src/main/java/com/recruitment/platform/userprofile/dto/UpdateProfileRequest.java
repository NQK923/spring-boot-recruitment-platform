package com.recruitment.platform.userprofile.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record UpdateProfileRequest(
    String fullName,
    String phoneNumber,
    String summary,
    List<ExperienceRequest> experiences,
    List<EducationRequest> education,
    List<SkillRequest> skills
) {}
