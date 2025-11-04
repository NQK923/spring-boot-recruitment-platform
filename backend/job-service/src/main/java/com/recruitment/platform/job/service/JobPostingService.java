package com.recruitment.platform.job.service;

import com.recruitment.platform.common.exception.ForbiddenException;
import com.recruitment.platform.common.exception.NotFoundException;
import com.recruitment.platform.job.client.CompanyServiceClient;
import com.recruitment.platform.job.client.dto.CompanyStatusResponse;
import com.recruitment.platform.job.dto.CreateJobPositionRequest;
import com.recruitment.platform.job.dto.CreateJobRequest;
import com.recruitment.platform.job.dto.JobPostingPublicDto;
import com.recruitment.platform.job.dto.UpdateJobRequest;
import com.recruitment.platform.job.model.JobPosition;
import com.recruitment.platform.job.model.JobPosting;
import com.recruitment.platform.job.model.JobStatus;
import com.recruitment.platform.job.repository.JobPositionRepository;
import com.recruitment.platform.job.repository.JobPostingRepository;
import feign.FeignException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class JobPostingService {
    private static final int DEFAULT_PAGE_SIZE = 12;
    private static final int MAX_PAGE_SIZE = 50;
    private static final Logger log = LoggerFactory.getLogger(JobPostingService.class);

    private final JobPostingRepository jobPostingRepository;
    private final JobPositionRepository jobPositionRepository;
    private final CompanyServiceClient companyServiceClient;

    public JobPostingService(JobPostingRepository jobPostingRepository,
                             JobPositionRepository jobPositionRepository,
                             CompanyServiceClient companyServiceClient) {
        this.jobPostingRepository = jobPostingRepository;
        this.jobPositionRepository = jobPositionRepository;
        this.companyServiceClient = companyServiceClient;
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
                .orElseThrow(() -> new NotFoundException("Job not found"));

        if (!job.getCompanyId().equals(companyId)) {
            throw new ForbiddenException("Cannot modify a job that belongs to a different company.");
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

    public Page<JobPostingPublicDto> searchPublicJobs(String searchTerm, Integer page, Integer size) {
        Pageable pageable = resolvePageable(page, size);
        List<Long> activeCompanyIds = fetchActiveCompanyIds();
        if (activeCompanyIds.isEmpty()) {
            return new PageImpl<JobPosting>(Collections.emptyList(), pageable, 0).map(this::convertToDto);
        }

        Page<JobPosting> resultPage;

        if (!hasText(searchTerm)) {
            resultPage = jobPostingRepository.findByStatusAndCompanyIdIn(JobStatus.PUBLISHED, activeCompanyIds, pageable);
        } else {
            String normalizedPattern = "%" + searchTerm.trim().toLowerCase(Locale.ROOT) + "%";
            resultPage = jobPostingRepository.searchPublishedJobsByTitleOrLocationAndCompanyIds(
                    JobStatus.PUBLISHED,
                    normalizedPattern,
                    activeCompanyIds,
                    pageable
            );
        }

        return resultPage.map(this::convertToDto);
    }

    public Optional<JobPosting> findJobById(Long id) {
        return jobPostingRepository.findById(id);
    }

    public Optional<JobPostingPublicDto> findPublicJobById(Long id) {
        return jobPostingRepository.findById(id)
                .filter(job -> job.getStatus() == JobStatus.PUBLISHED)
                .filter(job -> isCompanyActive(job.getCompanyId()))
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
                .orElseThrow(() -> new NotFoundException("Job position not found"));
        if (!position.getCompanyId().equals(companyId)) {
            throw new ForbiddenException("Job position does not belong to this company.");
        }
        return position;
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private Pageable resolvePageable(Integer page, Integer size) {
        int safePage = page != null && page >= 0 ? page : 0;
        int resolvedSize;
        if (size == null) {
            resolvedSize = DEFAULT_PAGE_SIZE;
        } else {
            resolvedSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        }
        Sort sort = Sort.by(
                Sort.Order.desc("updatedAt"),
                Sort.Order.desc("createdAt"),
                Sort.Order.desc("id")
        );
        return PageRequest.of(safePage, resolvedSize, sort);
    }

    private List<Long> fetchActiveCompanyIds() {
        try {
            List<Long> response = companyServiceClient.getActiveCompanyIds();
            if (response == null) {
                return Collections.emptyList();
            }
            return response.stream()
                    .filter(id -> id != null && id > 0)
                    .distinct()
                    .collect(Collectors.toList());
        } catch (FeignException ex) {
            log.warn("Unable to load active company IDs from company-service", ex);
            return Collections.emptyList();
        }
    }

    private boolean isCompanyActive(Long companyId) {
        if (companyId == null) {
            return false;
        }
        try {
            List<CompanyStatusResponse> responses = companyServiceClient.getCompanyStatuses(List.of(companyId));
            if (responses == null || responses.isEmpty()) {
                return false;
            }
            return responses.stream()
                    .anyMatch(response ->
                            companyId.equals(response.companyId())
                                    && "ACTIVE".equalsIgnoreCase(response.status()));
        } catch (FeignException ex) {
            log.warn("Unable to fetch status for company {}", companyId, ex);
            return false;
        }
    }
}
