package com.recruitment.platform.interview.controller;

import com.recruitment.platform.interview.dto.ScheduleRequest;
import com.recruitment.platform.interview.model.Interview;
import com.recruitment.platform.interview.repository.InterviewRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/interviews")
public class InterviewController {

    private final InterviewRepository repository;

    public InterviewController(InterviewRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('RECRUITER', 'COMPANY_ADMIN')")
    public Interview schedule(@RequestBody ScheduleRequest request) {
        // TODO: Add participants (candidate, interviewers)
        // TODO: Call ApplicationService to update application status to INTERVIEWING
        Interview interview = new Interview();
        interview.setApplicationId(request.applicationId());
        interview.setScheduledTime(request.scheduledTime());
        return repository.save(interview);
    }
}
