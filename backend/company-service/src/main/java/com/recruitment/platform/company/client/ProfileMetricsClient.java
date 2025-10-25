package com.recruitment.platform.company.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

@FeignClient(name = "gateway-profile-metrics-client", url = "http://gateway-service:8080")
public interface ProfileMetricsClient {

    record ProfileMetrics(long totalProfiles) {}

    @GetMapping("/api/internal/profiles/metrics/summary")
    ProfileMetrics getSummary();
}
