package com.recruitment.platform.application.controller;

import com.recruitment.platform.application.dto.ApplicationDetailsDto;
import com.recruitment.platform.application.dto.ApplyRequest;
import com.recruitment.platform.application.dto.CreateApplicationNoteRequest;
import com.recruitment.platform.application.dto.UpdateApplicationStatusRequest;
import com.recruitment.platform.application.model.Application;
import com.recruitment.platform.application.model.ApplicationNote;
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

    @GetMapping("/jobs/{jobPostingId}/applications")
    @PreAuthorize("hasAnyAuthority('SCOPE_RECRUITER', 'SCOPE_COMPANY_ADMIN') or hasAnyRole('RECRUITER', 'COMPANY_ADMIN')")
    public List<ApplicationDetailsDto> getApplicationsForJob(@PathVariable Long jobPostingId) {
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

    @GetMapping("/{applicationId}")
    @PreAuthorize("hasAnyAuthority('SCOPE_RECRUITER', 'SCOPE_COMPANY_ADMIN', 'SCOPE_CANDIDATE') or hasAnyRole('RECRUITER', 'COMPANY_ADMIN', 'CANDIDATE')")
    public ResponseEntity<ApplicationDetailsDto> getApplication(@PathVariable Long applicationId,
                                                                @AuthenticationPrincipal Jwt jwt) {
        ApplicationDetailsDto dto = service.getApplicationDetails(applicationId);
        if (isCandidate(jwt) && !dto.getCandidateId().equals(Long.valueOf(jwt.getSubject()))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{applicationId}/notes")
    @PreAuthorize("hasAnyAuthority('SCOPE_RECRUITER', 'SCOPE_COMPANY_ADMIN') or hasAnyRole('RECRUITER', 'COMPANY_ADMIN')")
    public ResponseEntity<List<ApplicationNote>> getApplicationNotes(@PathVariable Long applicationId) {
        return ResponseEntity.ok(service.getNotes(applicationId));
    }

    @PostMapping("/{applicationId}/notes")
    @PreAuthorize("hasAnyAuthority('SCOPE_RECRUITER', 'SCOPE_COMPANY_ADMIN') or hasAnyRole('RECRUITER', 'COMPANY_ADMIN')")
    public ResponseEntity<ApplicationNote> addApplicationNote(@PathVariable Long applicationId,
                                                              @AuthenticationPrincipal Jwt jwt,
                                                              @RequestBody CreateApplicationNoteRequest request) {
        Long authorUserId = Long.valueOf(jwt.getSubject());
        ApplicationNote note = service.addNote(applicationId, authorUserId, request.content());
        return new ResponseEntity<>(note, HttpStatus.CREATED);
    }

    private boolean isCandidate(Jwt jwt) {
        if (jwt == null) {
            return false;
        }
        Object rolesClaim = jwt.getClaim("roles");
        if (rolesClaim instanceof List<?> roles) {
            return roles.stream().anyMatch(role -> "CANDIDATE".equalsIgnoreCase(String.valueOf(role)));
        }
        if (rolesClaim instanceof String rolesString) {
            return rolesString.contains("CANDIDATE");
        }
        return false;
    }
}
