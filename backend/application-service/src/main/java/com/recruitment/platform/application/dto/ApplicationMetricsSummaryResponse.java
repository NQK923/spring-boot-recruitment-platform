package com.recruitment.platform.application.dto;

import java.util.Map;

public record ApplicationMetricsSummaryResponse(long totalApplications,
                                                Map<String, Long> applicationsByStatus) {
}
