package com.recruitment.platform.job.controller;

import com.recruitment.platform.job.dto.CompanyJobMetricsResponse;
import com.recruitment.platform.job.dto.JobMetricsSummaryResponse;
import com.recruitment.platform.job.service.JobMetricsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/internal/jobs/metrics")
public class JobMetricsController {

    private final JobMetricsService jobMetricsService;

    public JobMetricsController(JobMetricsService jobMetricsService) {
        this.jobMetricsService = jobMetricsService;
    }

    @GetMapping("/summary")
    public ResponseEntity<JobMetricsSummaryResponse> getSummary() {
        return ResponseEntity.ok(jobMetricsService.getSummary());
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<CompanyJobMetricsResponse> getCompanyMetrics(@PathVariable Long companyId) {
        return ResponseEntity.ok(jobMetricsService.getCompanyMetrics(companyId));
    }

    @GetMapping("/company/{companyId}/job-ids")
    public ResponseEntity<List<Long>> getJobIdsForCompany(@PathVariable Long companyId) {
        return ResponseEntity.ok(jobMetricsService.getJobIdsForCompany(companyId));
    }
}
