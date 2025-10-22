package com.recruitment.platform.company.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.Map;

@FeignClient(name = "gateway-application-metrics-client", url = "http://gateway-service:8080")
public interface ApplicationMetricsClient {

    record MetricsRequest(List<Long> jobPostingIds) { }

    record MetricsResponse(long totalApplications,
                           Map<String, Long> applicationsByStatus) { }

    @GetMapping("/api/internal/applications/metrics/summary")
    MetricsResponse getSummary();

    @PostMapping("/api/internal/applications/metrics/by-jobs")
    MetricsResponse getMetricsForJobs(@RequestBody MetricsRequest request);
}
