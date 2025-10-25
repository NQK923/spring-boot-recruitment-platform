package com.recruitment.platform.userprofile.controller;

import com.recruitment.platform.userprofile.dto.ProfileMetricsResponse;
import com.recruitment.platform.userprofile.service.ProfileMetricsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/internal/profiles/metrics")
public class ProfileMetricsController {

    private final ProfileMetricsService profileMetricsService;

    public ProfileMetricsController(ProfileMetricsService profileMetricsService) {
        this.profileMetricsService = profileMetricsService;
    }

    @GetMapping("/summary")
    public ProfileMetricsResponse getSummary() {
        return profileMetricsService.getSummary();
    }
}
