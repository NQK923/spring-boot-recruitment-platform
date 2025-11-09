package com.recruitment.platform.userprofile.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.recruitment.platform.userprofile.model.LanguageProficiency;

@JsonIgnoreProperties(ignoreUnknown = true)
public record LanguageRequest(
        String language,
        LanguageProficiency proficiency
) {}
