package com.recruitment.platform.job.controller;

import com.recruitment.platform.job.model.JobPosting;
import com.recruitment.platform.job.model.JobStatus;
import com.recruitment.platform.job.repository.JobPostingRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobPostingRepository repository;

    public JobController(JobPostingRepository repository) {
        this.repository = repository;
    }

    // Public endpoint
    @GetMapping("/public")
    public List<JobPosting> getOpenJobs() {
        return repository.findByStatus(JobStatus.OPEN);
    }

    // Secured endpoint
    @PostMapping
    public JobPosting createJob(@RequestBody JobPosting newJob) {
        // In a real app, you'd use a DTO and set companyId from the JWT
        newJob.setStatus(JobStatus.DRAFT);
        return repository.save(newJob);
    }
}
