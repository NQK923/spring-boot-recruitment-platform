package com.recruitment.platform.company.controller;

import com.recruitment.platform.company.dto.PublicOverviewResponse;
import com.recruitment.platform.company.service.PublicOverviewService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/companies/public")
public class PublicOverviewController {

    private final PublicOverviewService publicOverviewService;

    public PublicOverviewController(PublicOverviewService publicOverviewService) {
        this.publicOverviewService = publicOverviewService;
    }

    @GetMapping("/overview")
    public PublicOverviewResponse getPublicOverview() {
        return publicOverviewService.getOverview();
    }
}
