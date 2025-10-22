package com.recruitment.platform.company.dto;

import java.util.Map;

public record CompanyDashboardResponse(Long companyId,
                                       String companyName,
                                       long totalUsers,
                                       long recruiterCount,
                                       long totalJobPostings,
                                       Map<String, Long> jobsByStatus,
                                       long totalApplications,
                                       Map<String, Long> applicationsByStatus) {
}
