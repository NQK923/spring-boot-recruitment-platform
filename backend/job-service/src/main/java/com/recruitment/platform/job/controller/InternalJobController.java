package com.recruitment.platform.job.controller;

import com.recruitment.platform.job.dto.JobInternalDetails;
import com.recruitment.platform.job.model.JobPosting;
import com.recruitment.platform.job.service.JobPostingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/internal/jobs")
public class InternalJobController {

    private final JobPostingService jobPostingService;

    public InternalJobController(JobPostingService jobPostingService) {
        this.jobPostingService = jobPostingService;
    }

    @GetMapping("/{jobId}")
    public ResponseEntity<JobInternalDetails> getJobById(@PathVariable Long jobId) {
        return jobPostingService.findJobById(jobId)
                .map(this::mapToInternalDetails)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private JobInternalDetails mapToInternalDetails(JobPosting jobPosting) {
        return new JobInternalDetails(jobPosting.getId(), jobPosting.getCompanyId(), jobPosting.getStatus());
    }
}
