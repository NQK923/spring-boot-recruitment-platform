package com.recruitment.platform.application.controller;

import com.recruitment.platform.application.dto.ApplicationDetailsDto;
import com.recruitment.platform.application.service.ApplicationService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobApplicationQueryController {

    private final ApplicationService service;

    public JobApplicationQueryController(ApplicationService service) {
        this.service = service;
    }

    @GetMapping("/{jobPostingId}/applications")
    @PreAuthorize("hasAnyAuthority('SCOPE_RECRUITER', 'SCOPE_COMPANY_ADMIN') or hasAnyRole('RECRUITER', 'COMPANY_ADMIN')")
    public List<ApplicationDetailsDto> getApplicationsForJob(@PathVariable Long jobPostingId,
                                                             @RequestHeader("X-Company-ID") Long companyId) {
        service.assertRecruiterAccessToJob(jobPostingId, companyId);
        return service.findApplicationsByJobPostingId(jobPostingId);
    }
}
