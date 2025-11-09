package com.recruitment.platform.userprofile.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record CertificationRequest(
        String name,
        String issuer,
        String issueDate,
        String expireDate,
        String credentialId,
        String credentialUrl
) {}
