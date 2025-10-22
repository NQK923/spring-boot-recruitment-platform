package com.recruitment.platform.job.dto;

import java.util.Map;

public record JobMetricsSummaryResponse(long totalJobs,
                                        Map<String, Long> jobsByStatus,
                                        java.util.List<JobOpenRoleSummary> topCompaniesByOpenRoles) {
}
