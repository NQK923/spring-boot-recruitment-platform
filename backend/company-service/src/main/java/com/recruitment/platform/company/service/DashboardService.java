package com.recruitment.platform.company.service;

import com.recruitment.platform.common.exception.NotFoundException;
import com.recruitment.platform.company.client.ApplicationMetricsClient;
import com.recruitment.platform.company.client.JobMetricsClient;
import com.recruitment.platform.company.dto.CompanyDashboardResponse;
import com.recruitment.platform.company.dto.SuperAdminDashboardResponse;
import com.recruitment.platform.company.model.Company;
import com.recruitment.platform.company.repository.CompanyRepository;
import com.recruitment.platform.company.repository.CompanyUserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private static final String ROLE_RECRUITER = "RECRUITER";
    private final CompanyRepository companyRepository;
    private final CompanyUserRepository companyUserRepository;
    private final JobMetricsClient jobMetricsClient;
    private final ApplicationMetricsClient applicationMetricsClient;

    public DashboardService(CompanyRepository companyRepository,
                            CompanyUserRepository companyUserRepository,
                            JobMetricsClient jobMetricsClient,
                            ApplicationMetricsClient applicationMetricsClient) {
        this.companyRepository = companyRepository;
        this.companyUserRepository = companyUserRepository;
        this.jobMetricsClient = jobMetricsClient;
        this.applicationMetricsClient = applicationMetricsClient;
    }

    @Transactional(readOnly = true)
    public SuperAdminDashboardResponse getSuperAdminDashboard() {
        long totalCompanies = companyRepository.count();
        JobMetricsClient.JobMetricsSummary jobSummary = jobMetricsClient.getSummary();
        ApplicationMetricsClient.MetricsResponse applicationSummary = applicationMetricsClient.getSummary();

        List<Long> topCompanyIds = jobSummary.topCompaniesByOpenRoles().stream()
                .map(JobMetricsClient.TopCompany::companyId)
                .toList();

        Map<Long, Company> companyMap = topCompanyIds.isEmpty()
                ? Collections.emptyMap()
                : companyRepository.findAllById(topCompanyIds).stream()
                .collect(Collectors.toMap(Company::getId, Function.identity()));

        List<SuperAdminDashboardResponse.TopCompanyByOpenRoles> topCompanies = jobSummary.topCompaniesByOpenRoles().stream()
                .map(entry -> {
                    Company company = companyMap.get(entry.companyId());
                    String companyName = company != null ? company.getName() : "Unknown";
                    return new SuperAdminDashboardResponse.TopCompanyByOpenRoles(
                            entry.companyId(),
                            companyName,
                            entry.openRoles()
                    );
                })
                .toList();

        return new SuperAdminDashboardResponse(
                totalCompanies,
                jobSummary.totalJobs(),
                jobSummary.jobsByStatus(),
                applicationSummary.totalApplications(),
                applicationSummary.applicationsByStatus(),
                topCompanies
        );
    }

    @Transactional(readOnly = true)
    public CompanyDashboardResponse getCompanyDashboard(Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new NotFoundException("Company not found: " + companyId));

        JobMetricsClient.CompanyMetrics jobMetrics = jobMetricsClient.getCompanyMetrics(companyId);
        List<Long> jobIds = jobMetricsClient.getJobIdsForCompany(companyId);
        ApplicationMetricsClient.MetricsResponse applicationMetrics =
                jobIds.isEmpty()
                        ? new ApplicationMetricsClient.MetricsResponse(0, Map.of())
                        : applicationMetricsClient.getMetricsForJobs(new ApplicationMetricsClient.MetricsRequest(jobIds));

        long totalUsers = companyUserRepository.countById_CompanyId(companyId);
        long recruiters = companyUserRepository.countById_CompanyIdAndRole(companyId, ROLE_RECRUITER);

        return new CompanyDashboardResponse(
                company.getId(),
                company.getName(),
                totalUsers,
                recruiters,
                jobMetrics.totalJobs(),
                jobMetrics.jobsByStatus(),
                applicationMetrics.totalApplications(),
                applicationMetrics.applicationsByStatus()
        );
    }
}
