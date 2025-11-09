package com.recruitment.platform.application.controller;

import com.recruitment.platform.application.service.ApplicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/internal/applications")
public class InternalApplicationController {

    private final ApplicationService applicationService;

    public InternalApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @GetMapping("/candidates/{candidateId}/companies/{companyId}/exists")
    public ResponseEntity<Boolean> candidateHasApplicationsForCompany(@PathVariable Long candidateId,
                                                                      @PathVariable Long companyId) {
        return ResponseEntity.ok(applicationService.candidateHasApplicationsForCompany(candidateId, companyId));
    }

    @GetMapping("/jobs/{jobPostingId}/hired-count")
    public ResponseEntity<Long> countHiredApplications(@PathVariable Long jobPostingId) {
        return ResponseEntity.ok(applicationService.countHiredApplications(jobPostingId));
    }
}
