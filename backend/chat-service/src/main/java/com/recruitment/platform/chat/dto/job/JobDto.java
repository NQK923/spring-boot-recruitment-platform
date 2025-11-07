package com.recruitment.platform.chat.dto.job;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record JobDto(
    UUID id,
    UUID companyId,
    String companyName,
    String title,
    String description,
    String requirements,
    String location,
    String workType,
    SalaryRange salaryRange,
    String level,
    List<String> benefits,
    List<String> skills,
    String status,
    Instant postedAt,
    String url
) {

    public record SalaryRange(
        BigDecimal min,
        BigDecimal max,
        String currency,
        String period
    ) {
    }
}
