package com.recruitment.platform.job.service;

import com.recruitment.platform.common.exception.ForbiddenException;
import com.recruitment.platform.common.exception.NotFoundException;
import com.recruitment.platform.job.client.ApplicationServiceClient;
import com.recruitment.platform.job.client.ChatServiceClient;
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
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
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
    private final ChatServiceClient chatServiceClient;
    private final ApplicationServiceClient applicationServiceClient;

    public JobPostingService(JobPostingRepository jobPostingRepository,
                             JobPositionRepository jobPositionRepository,
                             CompanyServiceClient companyServiceClient,
                             ChatServiceClient chatServiceClient,
                             ApplicationServiceClient applicationServiceClient) {
        this.jobPostingRepository = jobPostingRepository;
        this.jobPositionRepository = jobPositionRepository;
        this.companyServiceClient = companyServiceClient;
        this.chatServiceClient = chatServiceClient;
        this.applicationServiceClient = applicationServiceClient;
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
        newJob.setHiringQuantity(normalizeHiringQuantity(request.hiringQuantity()));

        if (request.positionId() != null) {
            JobPosition jobPosition = resolveJobPosition(request.positionId(), companyId);
            newJob.setJobPosition(jobPosition);
        }

        JobPosting saved = jobPostingRepository.save(newJob);
        triggerRecommendationSync(saved);
        return saved;
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
        if (request.hiringQuantity() != null) {
            job.setHiringQuantity(normalizeHiringQuantity(request.hiringQuantity()));
        }
        if (request.positionId() != null) {
            JobPosition jobPosition = resolveJobPosition(request.positionId(), companyId);
            job.setJobPosition(jobPosition);
        }

        job.setUpdatedAt(Instant.now());
        JobPosting savedJob = jobPostingRepository.save(job);
        triggerRecommendationSync(savedJob);
        return savedJob;
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
            return new PageImpl<>(Collections.<JobPostingPublicDto>emptyList(), pageable, 0);
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

        return mapToPublicDtoPage(resultPage);
    }

    public Optional<JobPosting> findJobById(Long id) {
        return jobPostingRepository.findById(id);
    }

    public Optional<JobPostingPublicDto> findPublicJobById(Long id) {
        return jobPostingRepository.findById(id)
                .filter(job -> job.getStatus() == JobStatus.PUBLISHED)
                .filter(job -> isCompanyActive(job.getCompanyId()))
                .map(job -> convertToDto(job, resolveCompanyName(job.getCompanyId()), fetchHiredCount(job.getId())));
    }

    private JobPostingPublicDto convertToDto(JobPosting jobPosting, String companyName, Integer hiredCount) {
        JobPosition jobPosition = jobPosting.getJobPosition();
        String department = jobPosition != null ? jobPosition.getDepartment() : null;
        String level = jobPosition != null ? jobPosition.getLevel() : null;
        int totalSlots = jobPosting.getHiringQuantity() == null ? 1 : jobPosting.getHiringQuantity();
        int availableSlots = hiredCount == null ? totalSlots : calculateAvailableSlots(totalSlots, hiredCount);
        if (hiredCount != null) {
            maybeCloseJobWhenSlotsFilled(jobPosting, availableSlots);
        }

        return new JobPostingPublicDto(
                jobPosting.getId(),
                jobPosting.getCompanyId(),
                companyName,
                jobPosting.getTitle(),
                jobPosting.getDescription(),
                jobPosting.getRequirements(),
                jobPosting.getBenefits(),
                jobPosting.getSalaryRange(),
                totalSlots,
                availableSlots,
                jobPosting.getLocation(),
                jobPosting.getWorkType(),
                department,
                level,
                jobPosting.getStatus() != null ? jobPosting.getStatus().name() : null
        );
    }

    private Page<JobPostingPublicDto> mapToPublicDtoPage(Page<JobPosting> page) {
        if (page.isEmpty()) {
            return new PageImpl<>(Collections.<JobPostingPublicDto>emptyList(), page.getPageable(), page.getTotalElements());
        }
        Map<Long, String> companyNames = fetchCompanyNames(
                page.getContent().stream()
                        .map(JobPosting::getCompanyId)
                        .collect(Collectors.toList())
        );
        List<JobPostingPublicDto> dtos = page.getContent().stream()
                .map(job -> convertToDto(job, companyNames.get(job.getCompanyId()), null))
                .collect(Collectors.toList());
        return new PageImpl<>(dtos, page.getPageable(), page.getTotalElements());
    }

    private String resolveCompanyName(Long companyId) {
        if (companyId == null) {
            return null;
        }
        return fetchCompanyNames(List.of(companyId)).get(companyId);
    }

    private Map<Long, String> fetchCompanyNames(Collection<Long> companyIds) {
        if (companyIds == null || companyIds.isEmpty()) {
            return Collections.emptyMap();
        }
        List<Long> distinctIds = companyIds.stream()
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
        if (distinctIds.isEmpty()) {
            return Collections.emptyMap();
        }
        try {
            List<CompanyStatusResponse> responses = companyServiceClient.getCompanyStatuses(distinctIds);
            if (responses == null || responses.isEmpty()) {
                return Collections.emptyMap();
            }
            return responses.stream()
                    .filter(response -> response.companyId() != null && hasText(response.companyName()))
                    .collect(Collectors.toMap(
                            CompanyStatusResponse::companyId,
                            CompanyStatusResponse::companyName,
                            (existing, replacement) -> existing
                    ));
        } catch (FeignException ex) {
            log.warn("Unable to fetch company names for {}: {}", distinctIds, ex.getMessage());
            return Collections.emptyMap();
        }
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

    private void triggerRecommendationSync(JobPosting jobPosting) {
        if (jobPosting == null || jobPosting.getStatus() != JobStatus.PUBLISHED) {
            return;
        }
        try {
            chatServiceClient.reindexJob(jobPosting.getId());
        } catch (Exception ex) {
            log.warn("Không thể gọi chat-service để reindex job {}", jobPosting.getId(), ex);
        }
    }

    private int fetchHiredCount(Long jobPostingId) {
        if (jobPostingId == null) {
            return 0;
        }
        try {
            Long response = applicationServiceClient.countHiredApplications(jobPostingId);
            return response == null ? 0 : Math.max(response.intValue(), 0);
        } catch (Exception ex) {
            log.warn("Không thể lấy số lượng ứng viên đã nhận offer cho job {}", jobPostingId, ex);
            return 0;
        }
    }

    private int calculateAvailableSlots(int totalSlots, Integer hiredCount) {
        int hires = hiredCount == null ? 0 : Math.max(hiredCount, 0);
        int remaining = totalSlots - hires;
        return remaining < 0 ? 0 : remaining;
    }

    private void maybeCloseJobWhenSlotsFilled(JobPosting jobPosting, int availableSlots) {
        if (jobPosting == null || availableSlots > 0 || jobPosting.getStatus() == JobStatus.CLOSED) {
            return;
        }
        jobPosting.setStatus(JobStatus.CLOSED);
        jobPosting.setUpdatedAt(Instant.now());
        jobPostingRepository.save(jobPosting);
    }

    private int normalizeHiringQuantity(Integer rawQuantity) {
        if (rawQuantity == null || rawQuantity < 1) {
            return 1;
        }
        return rawQuantity;
    }
}
