package com.recruitment.platform.chat.dto.profile;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ProfileDto(
    UUID userId,
    UUID companyId,
    String summary,
    List<String> skills,
    List<String> preferredLocations,
    boolean remoteOk,
    BigDecimal salaryExpectation,
    List<String> industries,
    List<String> languages
) {
}
