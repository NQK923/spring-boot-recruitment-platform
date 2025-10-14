package com.recruitment.platform.application.controller;

import com.recruitment.platform.application.dto.ApplyRequest;
import com.recruitment.platform.application.dto.UpdateApplicationStatusRequest;
import com.recruitment.platform.application.model.Application;
import com.recruitment.platform.application.service.ApplicationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService service;

    public ApplicationController(ApplicationService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('SCOPE_CANDIDATE') or hasRole('CANDIDATE')")
    public ResponseEntity<Application> apply(@AuthenticationPrincipal Jwt jwt, @RequestBody ApplyRequest request) {
        Long candidateId = Long.valueOf(jwt.getSubject());
        Application savedApplication = service.submitApplication(candidateId, request);
        return new ResponseEntity<>(savedApplication, HttpStatus.CREATED);
    }

    @GetMapping("/my")
    @PreAuthorize("hasAuthority('SCOPE_CANDIDATE') or hasRole('CANDIDATE')")
    public List<Application> getMyApplications(@AuthenticationPrincipal Jwt jwt) {
        Long candidateId = Long.valueOf(jwt.getSubject());
        return service.findApplicationsByCandidateId(candidateId);
    }

    @GetMapping
    @RequestMapping("/jobs/{jobPostingId}/applications")
    @PreAuthorize("hasAnyAuthority('SCOPE_RECRUITER', 'SCOPE_COMPANY_ADMIN') or hasAnyRole('RECRUITER', 'COMPANY_ADMIN')")
    public List<Application> getApplicationsForJob(@PathVariable Long jobPostingId) {
        // TODO: Add check to ensure the recruiter has access to this job posting's company
        return service.findApplicationsByJobPostingId(jobPostingId);
    }

    @PatchMapping("/{applicationId}/status")
    @PreAuthorize("hasAnyAuthority('SCOPE_RECRUITER', 'SCOPE_COMPANY_ADMIN') or hasAnyRole('RECRUITER', 'COMPANY_ADMIN')")
    public ResponseEntity<Application> updateApplicationStatus(
            @PathVariable Long applicationId,
            @RequestBody UpdateApplicationStatusRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        Long changedByUserId = Long.valueOf(jwt.getSubject());
        // TODO: Add check to ensure the recruiter has access to this application's company
        Application updatedApplication = service.updateApplicationStatus(applicationId, request, changedByUserId);
        return ResponseEntity.ok(updatedApplication);
    }
}
