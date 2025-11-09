package com.recruitment.platform.userprofile.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.recruitment.platform.userprofile.model.SkillProficiency;

@JsonIgnoreProperties(ignoreUnknown = true)
public record SkillRequest(
        String skillName,
        SkillProficiency proficiency,
        Integer years
) {}
