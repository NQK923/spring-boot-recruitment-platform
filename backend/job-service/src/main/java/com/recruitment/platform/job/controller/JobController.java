package com.recruitment.platform.job.controller;

import com.recruitment.platform.job.dto.CreateJobPositionRequest;
import com.recruitment.platform.job.dto.CreateJobRequest;
import com.recruitment.platform.job.dto.JobPositionResponse;
import com.recruitment.platform.job.dto.JobPostingPublicDto;
import com.recruitment.platform.job.dto.PageResponse;
import com.recruitment.platform.job.dto.UpdateJobRequest;
import com.recruitment.platform.job.model.JobPosition;
import com.recruitment.platform.job.model.JobPosting;
import com.recruitment.platform.job.service.JobPostingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobPostingService service;

    public JobController(JobPostingService service) {
        this.service = service;
    }

    @GetMapping("/public")
    public PageResponse<JobPostingPublicDto> getOpenJobs(@RequestParam(value = "search", required = false) String search,
                                                         @RequestParam(value = "page", required = false) Integer page,
                                                         @RequestParam(value = "size", required = false) Integer size) {
        return PageResponse.of(service.searchPublicJobs(search, page, size));
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

    @PutMapping("/{jobId}")
    @PreAuthorize("hasAnyAuthority('SCOPE_RECRUITER', 'SCOPE_COMPANY_ADMIN')")
    public ResponseEntity<JobPosting> updateJob(@PathVariable Long jobId,
                                                @RequestBody UpdateJobRequest request,
                                                @RequestHeader("X-Company-ID") Long companyId) {
        JobPosting updated = service.updateJob(jobId, request, companyId);
        return ResponseEntity.ok(updated);
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('SCOPE_RECRUITER', 'SCOPE_COMPANY_ADMIN')")
    public ResponseEntity<List<JobPosting>> getCompanyJobs(@RequestHeader("X-Company-ID") Long companyId) {
        return ResponseEntity.ok(service.findJobsByCompany(companyId));
    }

    @PostMapping("/positions")
    @PreAuthorize("hasAuthority('SCOPE_COMPANY_ADMIN')")
    public ResponseEntity<JobPositionResponse> createPosition(@RequestHeader("X-Company-ID") Long companyId,
                                                              @RequestBody CreateJobPositionRequest request) {
        JobPosition position = service.createPosition(companyId, request);
        return new ResponseEntity<>(mapPosition(position), HttpStatus.CREATED);
    }

    @GetMapping("/positions")
    @PreAuthorize("hasAnyAuthority('SCOPE_RECRUITER', 'SCOPE_COMPANY_ADMIN')")
    public ResponseEntity<List<JobPositionResponse>> listPositions(@RequestHeader("X-Company-ID") Long companyId) {
        List<JobPositionResponse> responses = service.findPositions(companyId)
                .stream()
                .map(this::mapPosition)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    private JobPositionResponse mapPosition(JobPosition position) {
        return new JobPositionResponse(position.getId(), position.getTitle(), position.getDepartment(), position.getLevel());
    }
}
