package com.recruitment.platform.interview.controller;

import com.recruitment.platform.interview.dto.InterviewMetricsResponse;
import com.recruitment.platform.interview.service.InterviewMetricsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/internal/interviews/metrics")
public class InterviewMetricsController {

    private final InterviewMetricsService interviewMetricsService;

    public InterviewMetricsController(InterviewMetricsService interviewMetricsService) {
        this.interviewMetricsService = interviewMetricsService;
    }

    @GetMapping("/summary")
    public InterviewMetricsResponse getSummary() {
        return interviewMetricsService.getSummary();
    }
}
