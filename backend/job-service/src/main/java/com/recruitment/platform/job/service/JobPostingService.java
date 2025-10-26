package com.recruitment.platform.job.service;

import com.recruitment.platform.job.dto.CreateJobPositionRequest;
import com.recruitment.platform.job.dto.CreateJobRequest;
import com.recruitment.platform.job.dto.JobPostingPublicDto;
import com.recruitment.platform.job.dto.UpdateJobRequest;
import com.recruitment.platform.job.model.JobPosition;
import com.recruitment.platform.job.model.JobPosting;
import com.recruitment.platform.job.model.JobStatus;
import com.recruitment.platform.job.repository.JobPositionRepository;
import com.recruitment.platform.job.repository.JobPostingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class JobPostingService {

    private final JobPostingRepository jobPostingRepository;
    private final JobPositionRepository jobPositionRepository;

    public JobPostingService(JobPostingRepository jobPostingRepository,
                             JobPositionRepository jobPositionRepository) {
        this.jobPostingRepository = jobPostingRepository;
        this.jobPositionRepository = jobPositionRepository;
    }

    @Transactional
    public JobPosting createJob(CreateJobRequest request, Long companyId, Long recruiterId) {
        JobPosting newJob = new JobPosting();
        newJob.setTitle(request.title());
        newJob.setDescription(request.description());
        newJob.setRequirements(request.requirements());
        newJob.setSalaryRange(request.salaryRange());
        newJob.setBenefits(request.benefits());
        newJob.setLocation(request.location());
        newJob.setWorkType(request.workType());
        newJob.setCompanyId(companyId);
        newJob.setRecruiterId(recruiterId);
        newJob.setStatus(JobStatus.DRAFT);

        if (request.positionId() != null) {
            JobPosition jobPosition = resolveJobPosition(request.positionId(), companyId);
            newJob.setJobPosition(jobPosition);
        }

        return jobPostingRepository.save(newJob);
    }

    @Transactional
    public JobPosting updateJob(Long jobId, UpdateJobRequest request, Long companyId) {
        JobPosting job = jobPostingRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job not found"));

        if (!job.getCompanyId().equals(companyId)) {
            throw new IllegalStateException("Cannot modify a job that belongs to a different company.");
        }

        if (request.title() != null) {
            job.setTitle(request.title());
        }
        if (request.description() != null) {
            job.setDescription(request.description());
        }
        if (request.requirements() != null) {
            job.setRequirements(request.requirements());
        }
        if (request.salaryRange() != null) {
            job.setSalaryRange(request.salaryRange());
        }
        if (request.benefits() != null) {
            job.setBenefits(request.benefits());
        }
        if (request.location() != null) {
            job.setLocation(request.location());
        }
        if (request.workType() != null) {
            job.setWorkType(request.workType());
        }
        if (request.status() != null) {
            job.setStatus(JobStatus.valueOf(request.status().toUpperCase()));
        }
        if (request.positionId() != null) {
            JobPosition jobPosition = resolveJobPosition(request.positionId(), companyId);
            job.setJobPosition(jobPosition);
        }

        job.setUpdatedAt(Instant.now());
        return jobPostingRepository.save(job);
    }

    public List<JobPosting> findJobsByCompany(Long companyId) {
        return jobPostingRepository.findByCompanyId(companyId);
    }

    @Transactional
    public JobPosition createPosition(Long companyId, CreateJobPositionRequest request) {
        JobPosition position = new JobPosition();
        position.setCompanyId(companyId);
        position.setTitle(request.title());
        position.setDepartment(request.department());
        position.setLevel(request.level());
        return jobPositionRepository.save(position);
    }

    public List<JobPosition> findPositions(Long companyId) {
        return jobPositionRepository.findByCompanyId(companyId);
    }

    public List<JobPostingPublicDto> findAllPublicJobs() {
        return jobPostingRepository.findByStatus(JobStatus.PUBLISHED).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<JobPostingPublicDto> searchPublicJobs(String searchTerm) {
        if (!hasText(searchTerm)) {
            return findAllPublicJobs();
        }

        String normalizedPattern = "%" + searchTerm.trim().toLowerCase(Locale.ROOT) + "%";
        return jobPostingRepository.searchPublishedJobsByTitleOrLocation(JobStatus.PUBLISHED, normalizedPattern).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public Optional<JobPosting> findJobById(Long id) {
        return jobPostingRepository.findById(id);
    }

    public Optional<JobPostingPublicDto> findPublicJobById(Long id) {
        return jobPostingRepository.findById(id)
                .filter(job -> job.getStatus() == JobStatus.PUBLISHED)
                .map(this::convertToDto);
    }

    private JobPostingPublicDto convertToDto(JobPosting jobPosting) {
        JobPosition jobPosition = jobPosting.getJobPosition();
        String department = jobPosition != null ? jobPosition.getDepartment() : null;
        String level = jobPosition != null ? jobPosition.getLevel() : null;

        return new JobPostingPublicDto(
                jobPosting.getId(),
                jobPosting.getCompanyId(),
                jobPosting.getTitle(),
                jobPosting.getDescription(),
                jobPosting.getRequirements(),
                jobPosting.getBenefits(),
                jobPosting.getSalaryRange(),
                jobPosting.getLocation(),
                jobPosting.getWorkType(),
                department,
                level,
                jobPosting.getStatus() != null ? jobPosting.getStatus().name() : null
        );
    }

    private JobPosition resolveJobPosition(Long positionId, Long companyId) {
        JobPosition position = jobPositionRepository.findById(positionId)
                .orElseThrow(() -> new IllegalArgumentException("Job position not found"));
        if (!position.getCompanyId().equals(companyId)) {
            throw new IllegalStateException("Job position does not belong to this company.");
        }
        return position;
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
