package com.recruitment.platform.job.dto;

import java.util.List;

public record PageResponse<T>(
        List<T> items,
        long totalItems,
        int totalPages,
        int page,
        int size,
        boolean hasNext,
        boolean hasPrevious
) {
    public static <T> PageResponse<T> of(org.springframework.data.domain.Page<T> page) {
        return new PageResponse<>(
                page.getContent(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.getNumber(),
                page.getSize(),
                page.hasNext(),
                page.hasPrevious()
        );
    }
}
