package com.recruitment.platform.job.controller;

import com.recruitment.platform.job.dto.CreateJobRequest;
import com.recruitment.platform.job.dto.JobPostingPublicDto;
import com.recruitment.platform.job.model.JobPosting;
import com.recruitment.platform.job.service.JobPostingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobPostingService service;

    public JobController(JobPostingService service) {
        this.service = service;
    }

    @GetMapping("/public")
    public List<JobPostingPublicDto> getOpenJobs() {
        return service.findAllPublicJobs();
    }

    @GetMapping("/public/{id}")
    public ResponseEntity<JobPostingPublicDto> getPublicJobById(@PathVariable Long id) {
        return service.findPublicJobById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('SCOPE_RECRUITER', 'SCOPE_COMPANY_ADMIN')")
    public ResponseEntity<JobPosting> createJob(@RequestBody CreateJobRequest request,
                                                @RequestHeader("X-Company-ID") Long companyId,
                                                @AuthenticationPrincipal Jwt jwt) {
        Long recruiterId = Long.valueOf(jwt.getSubject());
        JobPosting createdJob = service.createJob(request, companyId, recruiterId);
        return new ResponseEntity<>(createdJob, HttpStatus.CREATED);
    }
}
