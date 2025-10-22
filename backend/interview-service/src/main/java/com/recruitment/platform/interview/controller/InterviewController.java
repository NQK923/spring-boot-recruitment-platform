package com.recruitment.platform.interview.controller;

import com.recruitment.platform.interview.dto.FeedbackRequest;
import com.recruitment.platform.interview.dto.InterviewResponse;
import com.recruitment.platform.interview.dto.ScheduleRequest;
import com.recruitment.platform.interview.dto.UpdateInterviewRequest;
import com.recruitment.platform.interview.model.Interview;
import com.recruitment.platform.interview.model.InterviewFeedback;
import com.recruitment.platform.interview.service.InterviewService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<InterviewResponse>> getMyInterviews(@AuthenticationPrincipal Jwt jwt) {
        Long userId = Long.valueOf(jwt.getSubject());
        return ResponseEntity.ok(service.getInterviewsForUser(userId));
    }

    @PutMapping("/{interviewId}")
    @PreAuthorize("hasAnyAuthority('SCOPE_RECRUITER', 'SCOPE_COMPANY_ADMIN', 'SCOPE_CANDIDATE') or hasAnyRole('RECRUITER', 'COMPANY_ADMIN', 'CANDIDATE')")
    public ResponseEntity<Interview> rescheduleInterview(@PathVariable Long interviewId,
                                                         @RequestBody UpdateInterviewRequest request) {
        Interview updated = service.rescheduleInterview(interviewId, request);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{interviewId}/feedback")
    @PreAuthorize("hasAnyAuthority('SCOPE_RECRUITER', 'SCOPE_COMPANY_ADMIN') or hasAnyRole('RECRUITER', 'COMPANY_ADMIN')")
    public ResponseEntity<InterviewFeedback> submitFeedback(@PathVariable Long interviewId,
                                                            @AuthenticationPrincipal Jwt jwt,
                                                            @RequestBody FeedbackRequest request) {
        Long interviewerId = Long.valueOf(jwt.getSubject());
        InterviewFeedback feedback = service.recordFeedback(interviewId, interviewerId, request);
        return new ResponseEntity<>(feedback, HttpStatus.CREATED);
    }

    @GetMapping(value = "/{interviewId}/calendar.ics", produces = "text/calendar")
    @PreAuthorize("hasAnyAuthority('SCOPE_RECRUITER', 'SCOPE_COMPANY_ADMIN', 'SCOPE_CANDIDATE') or hasAnyRole('RECRUITER', 'COMPANY_ADMIN', 'CANDIDATE')")
    public ResponseEntity<String> downloadInterviewCalendar(@PathVariable Long interviewId,
                                                            @AuthenticationPrincipal Jwt jwt) {
        Long userId = Long.valueOf(jwt.getSubject());
        String calendar = service.generateInterviewCalendar(interviewId, userId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"interview-" + interviewId + ".ics\"")
                .body(calendar);
    }

    @GetMapping(value = "/my/calendar.ics", produces = "text/calendar")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> downloadMyCalendar(@AuthenticationPrincipal Jwt jwt) {
        Long userId = Long.valueOf(jwt.getSubject());
        String calendar = service.generateCalendarForUser(userId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"interviews-" + userId + ".ics\"")
                .body(calendar);
    }
}
