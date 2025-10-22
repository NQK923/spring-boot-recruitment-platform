package com.recruitment.platform.job.dto;

import java.util.Map;

public record CompanyJobMetricsResponse(Long companyId,
                                        long totalJobs,
                                        Map<String, Long> jobsByStatus) {
}
