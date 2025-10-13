package com.recruitment.platform.application.controller;

import com.recruitment.platform.application.dto.ApplyRequest;
import com.recruitment.platform.application.model.Application;
import com.recruitment.platform.application.model.ApplicationStatus;
import com.recruitment.platform.application.repository.ApplicationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationRepository repository;

    public ApplicationController(ApplicationRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('SCOPE_CANDIDATE') or hasRole('CANDIDATE')") // Example authority check
    public Application apply(@AuthenticationPrincipal Jwt jwt, @RequestBody ApplyRequest request) {
        Long candidateId = Long.valueOf(jwt.getSubject());
        
        // TODO: Check for duplicates, check if job is open, etc.

        Application app = new Application();
        app.setCandidateId(candidateId);
        app.setJobPostingId(request.jobPostingId());
        app.setCvId(request.cvId());
        app.setStatus(ApplicationStatus.APPLIED);
        
        // TODO: Create ApplicationHistory record

        return repository.save(app);
    }

    @GetMapping("/my")
    public List<Application> getMyApplications(@AuthenticationPrincipal Jwt jwt) {
        Long candidateId = Long.valueOf(jwt.getSubject());
        return repository.findByCandidateId(candidateId);
    }
}
