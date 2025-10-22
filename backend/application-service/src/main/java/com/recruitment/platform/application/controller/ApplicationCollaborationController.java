package com.recruitment.platform.application.controller;

import com.recruitment.platform.application.dto.CreateApplicationTaskRequest;
import com.recruitment.platform.application.dto.UpdateApplicationOwnerRequest;
import com.recruitment.platform.application.dto.UpdateApplicationTaskRequest;
import com.recruitment.platform.application.model.Application;
import com.recruitment.platform.application.model.ApplicationTask;
import com.recruitment.platform.application.service.ApplicationCollaborationService;
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
public class ApplicationCollaborationController {

    private final ApplicationService applicationService;
    private final ApplicationCollaborationService collaborationService;

    public ApplicationCollaborationController(ApplicationService applicationService,
                                              ApplicationCollaborationService collaborationService) {
        this.applicationService = applicationService;
        this.collaborationService = collaborationService;
    }

    @PatchMapping("/{applicationId}/owner")
    @PreAuthorize("hasAnyAuthority('SCOPE_RECRUITER', 'SCOPE_COMPANY_ADMIN') or hasAnyRole('RECRUITER', 'COMPANY_ADMIN')")
    public ResponseEntity<Application> updateApplicationOwner(@PathVariable Long applicationId,
                                                              @AuthenticationPrincipal Jwt jwt,
                                                              @RequestHeader("X-Company-ID") Long companyId,
                                                              @RequestBody UpdateApplicationOwnerRequest request) {
        Long requesterId = Long.valueOf(jwt.getSubject());
        Application application = applicationService.assignOwner(applicationId, request.ownerUserId(), requesterId, companyId);
        return ResponseEntity.ok(application);
    }

    @GetMapping("/{applicationId}/tasks")
    @PreAuthorize("hasAnyAuthority('SCOPE_RECRUITER', 'SCOPE_COMPANY_ADMIN') or hasAnyRole('RECRUITER', 'COMPANY_ADMIN')")
    public ResponseEntity<List<ApplicationTask>> getTasks(@PathVariable Long applicationId,
                                                          @RequestHeader("X-Company-ID") Long companyId) {
        return ResponseEntity.ok(collaborationService.getTasks(applicationId, companyId));
    }

    @PostMapping("/{applicationId}/tasks")
    @PreAuthorize("hasAnyAuthority('SCOPE_RECRUITER', 'SCOPE_COMPANY_ADMIN') or hasAnyRole('RECRUITER', 'COMPANY_ADMIN')")
    public ResponseEntity<ApplicationTask> createTask(@PathVariable Long applicationId,
                                                      @AuthenticationPrincipal Jwt jwt,
                                                      @RequestHeader("X-Company-ID") Long companyId,
                                                      @RequestBody CreateApplicationTaskRequest request) {
        Long creatorId = Long.valueOf(jwt.getSubject());
        ApplicationTask task = collaborationService.createTask(applicationId, companyId, creatorId, request);
        return new ResponseEntity<>(task, HttpStatus.CREATED);
    }

    @PatchMapping("/{applicationId}/tasks/{taskId}")
    @PreAuthorize("hasAnyAuthority('SCOPE_RECRUITER', 'SCOPE_COMPANY_ADMIN') or hasAnyRole('RECRUITER', 'COMPANY_ADMIN')")
    public ResponseEntity<ApplicationTask> updateTask(@PathVariable Long applicationId,
                                                      @PathVariable Long taskId,
                                                      @RequestHeader("X-Company-ID") Long companyId,
                                                      @RequestBody UpdateApplicationTaskRequest request) {
        ApplicationTask task = collaborationService.updateTask(applicationId, taskId, companyId, request);
        return ResponseEntity.ok(task);
    }
}
