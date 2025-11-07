package com.recruitment.platform.chat.dto.job;

import java.time.Instant;

public record JobDto(
    Long id,
    Long companyId,
    String companyName,
    String title,
    String description,
    String requirements,
    String benefits,
    String salaryRange,
    String location,
    String workType,
    String department,
    String level,
    String status,
    Instant postedAt,
    String url
) {
}
