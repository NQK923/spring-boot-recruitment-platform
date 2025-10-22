package com.recruitment.platform.application.controller;

import com.recruitment.platform.application.dto.ApplicationMetricsRequest;
import com.recruitment.platform.application.dto.ApplicationMetricsResponse;
import com.recruitment.platform.application.dto.ApplicationMetricsSummaryResponse;
import com.recruitment.platform.application.service.ApplicationMetricsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/internal/applications/metrics")
public class ApplicationMetricsController {

    private final ApplicationMetricsService service;

    public ApplicationMetricsController(ApplicationMetricsService service) {
        this.service = service;
    }

    @GetMapping("/summary")
    public ResponseEntity<ApplicationMetricsSummaryResponse> getSummary() {
        return ResponseEntity.ok(service.getSummary());
    }

    @PostMapping("/by-jobs")
    public ResponseEntity<ApplicationMetricsResponse> getMetricsForJobs(@RequestBody ApplicationMetricsRequest request) {
        return ResponseEntity.ok(service.getMetrics(request));
    }
}
