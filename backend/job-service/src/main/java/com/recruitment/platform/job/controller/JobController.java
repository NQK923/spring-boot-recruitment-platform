package com.recruitment.platform.job.controller;

import com.recruitment.platform.job.dto.JobPostingPublicDto;
import com.recruitment.platform.job.model.JobPosting;
import com.recruitment.platform.job.model.JobStatus;
import com.recruitment.platform.job.service.JobPostingService;
import org.springframework.http.ResponseEntity;
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

    // Secured endpoint - left for future implementation
    /*
    @PostMapping
    public JobPosting createJob(@RequestBody JobPosting newJob) {
        // In a real app, you'd use a DTO and set companyId from the JWT
        newJob.setStatus(JobStatus.DRAFT);
        return repository.save(newJob);
    }
    */
}
