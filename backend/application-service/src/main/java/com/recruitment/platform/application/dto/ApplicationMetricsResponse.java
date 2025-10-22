package com.recruitment.platform.application.dto;

import java.util.Map;

public record ApplicationMetricsResponse(long totalApplications,
                                         Map<String, Long> applicationsByStatus) {
}
