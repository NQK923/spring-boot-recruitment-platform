package com.recruitment.platform.userprofile.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record UpdateEnrichedProfileRequest(
        String fullName,
        String phoneNumber,
        String summary,
        String emailForCv,
        String location,
        String website,
        String linkedin,
        String github,
        String portfolio,
        Integer yearsOfExperience,
        String desiredPosition,
        String workAuthorization,
        Boolean openToRelocate,
        String preferredCvLanguage
) {}
