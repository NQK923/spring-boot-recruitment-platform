package com.recruitment.platform.application.controller;

import com.recruitment.platform.application.dto.ApplicationDetailsDto;
import com.recruitment.platform.application.dto.ApplicationInterviewDetailsDto;
import com.recruitment.platform.application.dto.ApplicationOfferDetailsDto;
import com.recruitment.platform.application.dto.ApplyRequest;
import com.recruitment.platform.application.dto.CreateApplicationNoteRequest;
import com.recruitment.platform.application.dto.OfferDecisionRequest;
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
import java.util.Objects;

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
    public List<ApplicationDetailsDto> getApplicationsForJob(@PathVariable Long jobPostingId,
                                                             @RequestHeader("X-Company-ID") Long companyId) {
        service.assertRecruiterAccessToJob(jobPostingId, companyId);
        return service.findApplicationsByJobPostingId(jobPostingId);
    }

    @PatchMapping("/{applicationId}/status")
    @PreAuthorize("hasAnyAuthority('SCOPE_RECRUITER', 'SCOPE_COMPANY_ADMIN') or hasAnyRole('RECRUITER', 'COMPANY_ADMIN')")
    public ResponseEntity<Application> updateApplicationStatus(
            @PathVariable Long applicationId,
            @RequestBody UpdateApplicationStatusRequest request,
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader("X-Company-ID") Long companyId) {
        Long changedByUserId = Long.valueOf(jwt.getSubject());
        Application updatedApplication = service.updateApplicationStatus(applicationId, request, changedByUserId, companyId);
        return ResponseEntity.ok(updatedApplication);
    }

    @GetMapping("/{applicationId}")
    @PreAuthorize("hasAnyAuthority('SCOPE_RECRUITER', 'SCOPE_COMPANY_ADMIN', 'SCOPE_CANDIDATE') or hasAnyRole('RECRUITER', 'COMPANY_ADMIN', 'CANDIDATE')")
    public ResponseEntity<ApplicationDetailsDto> getApplication(@PathVariable Long applicationId,
                                                                @AuthenticationPrincipal Jwt jwt,
                                                                @RequestHeader(value = "X-Company-ID", required = false) Long companyId) {
        boolean isCandidate = isCandidate(jwt);
        if (!isCandidate) {
            if (companyId == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            service.assertRecruiterAccessToApplication(applicationId, companyId);
        }
        ApplicationDetailsDto dto = service.getApplicationDetails(applicationId);
        if (isCandidate && !dto.getCandidateId().equals(Long.valueOf(jwt.getSubject()))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{applicationId}/notes")
    @PreAuthorize("hasAnyAuthority('SCOPE_RECRUITER', 'SCOPE_COMPANY_ADMIN') or hasAnyRole('RECRUITER', 'COMPANY_ADMIN')")
    public ResponseEntity<List<ApplicationNote>> getApplicationNotes(@PathVariable Long applicationId,
                                                                     @RequestHeader("X-Company-ID") Long companyId) {
        service.assertRecruiterAccessToApplication(applicationId, companyId);
        return ResponseEntity.ok(service.getNotes(applicationId));
    }

    @PostMapping("/{applicationId}/notes")
    @PreAuthorize("hasAnyAuthority('SCOPE_RECRUITER', 'SCOPE_COMPANY_ADMIN') or hasAnyRole('RECRUITER', 'COMPANY_ADMIN')")
    public ResponseEntity<ApplicationNote> addApplicationNote(@PathVariable Long applicationId,
                                                              @AuthenticationPrincipal Jwt jwt,
                                                              @RequestHeader("X-Company-ID") Long companyId,
                                                              @RequestBody CreateApplicationNoteRequest request) {
        Long authorUserId = Long.valueOf(jwt.getSubject());
        service.assertRecruiterAccessToApplication(applicationId, companyId);
        ApplicationNote note = service.addNote(applicationId, authorUserId, request.content());
        return new ResponseEntity<>(note, HttpStatus.CREATED);
    }

    @GetMapping("/{applicationId}/interview")
    @PreAuthorize("hasAnyAuthority('SCOPE_RECRUITER', 'SCOPE_COMPANY_ADMIN', 'SCOPE_CANDIDATE') or hasAnyRole('RECRUITER', 'COMPANY_ADMIN', 'CANDIDATE')")
    public ResponseEntity<ApplicationInterviewDetailsDto> getInterviewDetails(@PathVariable Long applicationId,
                                                                              @AuthenticationPrincipal Jwt jwt,
                                                                              @RequestHeader(value = "X-Company-ID", required = false) Long companyId) {
        if (isCandidate(jwt)) {
            if (!candidateOwnsApplication(applicationId, jwt)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        } else {
            if (companyId == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            service.assertRecruiterAccessToApplication(applicationId, companyId);
        }

        return service.getInterviewDetails(applicationId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/{applicationId}/offer")
    @PreAuthorize("hasAnyAuthority('SCOPE_RECRUITER', 'SCOPE_COMPANY_ADMIN', 'SCOPE_CANDIDATE') or hasAnyRole('RECRUITER', 'COMPANY_ADMIN', 'CANDIDATE')")
    public ResponseEntity<ApplicationOfferDetailsDto> getOfferDetails(@PathVariable Long applicationId,
                                                                      @AuthenticationPrincipal Jwt jwt,
                                                                      @RequestHeader(value = "X-Company-ID", required = false) Long companyId) {
        if (isCandidate(jwt)) {
            if (!candidateOwnsApplication(applicationId, jwt)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        } else {
            if (companyId == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            service.assertRecruiterAccessToApplication(applicationId, companyId);
        }

        return service.getOfferDetails(applicationId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping("/{applicationId}/offer/response")
    @PreAuthorize("hasAuthority('SCOPE_CANDIDATE') or hasRole('CANDIDATE')")
    public ResponseEntity<ApplicationOfferDetailsDto> respondOffer(@PathVariable Long applicationId,
                                                                   @AuthenticationPrincipal Jwt jwt,
                                                                   @RequestBody OfferDecisionRequest request) {
        if (request == null || request.decision() == null) {
            return ResponseEntity.badRequest().build();
        }
        Long candidateId = Long.valueOf(jwt.getSubject());
        service.respondToOffer(applicationId, request, candidateId);
        return service.getOfferDetails(applicationId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
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

    private boolean candidateOwnsApplication(Long applicationId, Jwt jwt) {
        if (jwt == null) {
            return false;
        }
        Long candidateId = Long.valueOf(jwt.getSubject());
        return service.findById(applicationId)
                .map(app -> Objects.equals(app.getCandidateId(), candidateId))
                .orElse(false);
    }
}
