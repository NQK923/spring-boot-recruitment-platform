package com.recruitment.platform.company.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

@FeignClient(name = "gateway-interview-metrics-client", url = "http://gateway-service:8080")
public interface InterviewMetricsClient {

    record InterviewMetrics(long totalInterviews, long upcomingInterviews) {}

    @GetMapping("/api/internal/interviews/metrics/summary")
    InterviewMetrics getSummary();
}
