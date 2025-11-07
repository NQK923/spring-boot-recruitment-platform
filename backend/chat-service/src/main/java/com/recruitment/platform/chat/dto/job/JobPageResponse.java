package com.recruitment.platform.chat.dto.job;

import java.util.List;

public record JobPageResponse(
    List<JobDto> items,
    long totalItems,
    int totalPages,
    int page,
    int size,
    boolean hasNext,
    boolean hasPrevious
) {
}
