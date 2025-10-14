package com.recruitment.platform.interview.controller;

import com.recruitment.platform.interview.dto.ScheduleRequest;
import com.recruitment.platform.interview.model.Interview;
import com.recruitment.platform.interview.service.InterviewService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/interviews")
public class InterviewController {

    private final InterviewService service;

    public InterviewController(InterviewService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('SCOPE_RECRUITER', 'SCOPE_COMPANY_ADMIN') or hasAnyRole('RECRUITER', 'COMPANY_ADMIN')")
    public ResponseEntity<Interview> schedule(
            @RequestBody ScheduleRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        Long recruiterId = Long.valueOf(jwt.getSubject());
        Interview savedInterview = service.scheduleInterview(request, recruiterId);
        return new ResponseEntity<>(savedInterview, HttpStatus.CREATED);
    }
}
