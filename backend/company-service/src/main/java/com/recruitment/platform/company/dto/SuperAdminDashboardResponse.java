package com.recruitment.platform.company.dto;

import java.util.List;
import java.util.Map;

public record SuperAdminDashboardResponse(long totalCompanies,
                                          long totalJobPostings,
                                          Map<String, Long> jobsByStatus,
                                          long totalApplications,
                                          Map<String, Long> applicationsByStatus,
                                          List<TopCompanyByOpenRoles> topCompaniesByOpenRoles) {

    public record TopCompanyByOpenRoles(Long companyId, String companyName, long openRoles) { }
}
