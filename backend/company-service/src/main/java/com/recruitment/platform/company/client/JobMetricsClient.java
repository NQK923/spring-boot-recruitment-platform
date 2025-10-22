package com.recruitment.platform.company.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.Map;

@FeignClient(name = "gateway-job-metrics-client", url = "http://gateway-service:8080")
public interface JobMetricsClient {

    record JobMetricsSummary(long totalJobs,
                             Map<String, Long> jobsByStatus,
                             List<TopCompany> topCompaniesByOpenRoles) { }

    record TopCompany(Long companyId, long openRoles) { }

    record CompanyMetrics(Long companyId,
                          long totalJobs,
                          Map<String, Long> jobsByStatus) { }

    @GetMapping("/api/internal/jobs/metrics/summary")
    JobMetricsSummary getSummary();

    @GetMapping("/api/internal/jobs/metrics/company/{companyId}")
    CompanyMetrics getCompanyMetrics(@PathVariable("companyId") Long companyId);

    @GetMapping("/api/internal/jobs/metrics/company/{companyId}/job-ids")
    List<Long> getJobIdsForCompany(@PathVariable("companyId") Long companyId);
}
