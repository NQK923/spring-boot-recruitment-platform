package com.recruitment.platform.application.service;

import com.recruitment.platform.application.client.JobServiceClient;
import com.recruitment.platform.application.client.UserProfileServiceClient;
import com.recruitment.platform.application.client.dto.JobSummaryDto;
import com.recruitment.platform.application.client.dto.UserProfileDto;
import com.recruitment.platform.application.dto.ApplicationDetailsDto;
import com.recruitment.platform.application.dto.ApplyRequest;
import com.recruitment.platform.application.dto.UpdateApplicationStatusRequest;
import com.recruitment.platform.application.event.ApplicationStatusChangedEvent;
import com.recruitment.platform.application.model.Application;
import com.recruitment.platform.application.model.ApplicationHistory;
import com.recruitment.platform.application.model.ApplicationNote;
import com.recruitment.platform.application.model.ApplicationStatus;
import com.recruitment.platform.application.repository.ApplicationNoteRepository;
import com.recruitment.platform.application.repository.ApplicationHistoryRepository;
import com.recruitment.platform.application.repository.ApplicationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.stream.function.StreamBridge;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ApplicationService {

    private static final Logger log = LoggerFactory.getLogger(ApplicationService.class);
    private final ApplicationRepository applicationRepository;
    private final ApplicationHistoryRepository historyRepository;
    private final ApplicationNoteRepository noteRepository;
    private final StreamBridge streamBridge;
    private final UserProfileServiceClient userProfileServiceClient;
    private final JobServiceClient jobServiceClient;

    public ApplicationService(ApplicationRepository applicationRepository,
                              ApplicationHistoryRepository historyRepository,
                              ApplicationNoteRepository noteRepository,
                              StreamBridge streamBridge,
                              UserProfileServiceClient userProfileServiceClient,
                              JobServiceClient jobServiceClient) {
        this.applicationRepository = applicationRepository;
        this.historyRepository = historyRepository;
        this.noteRepository = noteRepository;
        this.streamBridge = streamBridge;
        this.userProfileServiceClient = userProfileServiceClient;
        this.jobServiceClient = jobServiceClient;
    }

    @Transactional
    public Application submitApplication(Long candidateId, ApplyRequest request) {
        JobSummaryDto job = getJobSummaryOrThrow(request.jobPostingId());

        if (!job.isOpen()) {
            throw new IllegalStateException("Job is not open for applications.");
        }

        if (applicationRepository.existsByCandidateIdAndJobPostingId(candidateId, request.jobPostingId())) {
            throw new IllegalStateException("Candidate has already applied for this job.");
        }

        Application app = new Application();
        app.setCandidateId(candidateId);
        app.setJobPostingId(request.jobPostingId());
        app.setCvId(request.cvId());
        app.setSource(request.source());
        app.setStatus(ApplicationStatus.APPLIED);

        Application savedApp = applicationRepository.save(app);

        // Publish status change event
        publishStatusChangeEvent(savedApp, null, candidateId);

        return savedApp;
    }

    @Transactional
    public Application updateApplicationStatus(Long applicationId,
                                               UpdateApplicationStatusRequest request,
                                               Long changedByUserId,
                                               Long companyId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));

        assertRecruiterAccessToJob(application.getJobPostingId(), companyId);

        ApplicationStatus oldStatus = application.getStatus();
        ApplicationStatus newStatus = ApplicationStatus.valueOf(request.newStatus().toUpperCase());

        if (oldStatus == newStatus) {
            return application;
        }

        application.setStatus(newStatus);
        Application savedApplication = applicationRepository.save(application);

        ApplicationHistory history = new ApplicationHistory();
        history.setApplicationId(applicationId);
        history.setFromStatus(oldStatus);
        history.setToStatus(newStatus);
        history.setChangedByUserId(changedByUserId);
        historyRepository.save(history);

        publishStatusChangeEvent(savedApplication, oldStatus, changedByUserId);

        return savedApplication;
    }

    public List<Application> findApplicationsByCandidateId(Long candidateId) {
        return applicationRepository.findByCandidateId(candidateId);
    }

    public Optional<Application> findById(Long applicationId) {
        return applicationRepository.findById(applicationId);
    }

    public List<ApplicationDetailsDto> findApplicationsByJobPostingId(Long jobPostingId) {
        List<Application> applications = applicationRepository.findByJobPostingId(jobPostingId);
        if (applications.isEmpty()) {
            return Collections.emptyList();
        }

        Map<Long, String> candidateNames = fetchCandidateNames(
                applications.stream().map(Application::getCandidateId).distinct().toList()
        );

        return applications.stream()
                .map(app -> enrichWithCandidateName(ApplicationDetailsDto.fromApplication(app), candidateNames))
                .collect(Collectors.toList());
    }

    public List<ApplicationNote> getNotes(Long applicationId) {
        return noteRepository.findByApplicationIdOrderByCreatedAtDesc(applicationId);
    }

    @Transactional
    public ApplicationNote addNote(Long applicationId, Long authorUserId, String content) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));

        ApplicationNote note = new ApplicationNote();
        note.setApplicationId(application.getId());
        note.setAuthorUserId(authorUserId);
        note.setContent(content);
        return noteRepository.save(note);
    }

    public ApplicationDetailsDto getApplicationDetails(Long applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));
        Map<Long, String> candidateNames = fetchCandidateNames(List.of(application.getCandidateId()));
        return enrichWithCandidateName(ApplicationDetailsDto.fromApplication(application), candidateNames);
    }

    public void assertRecruiterAccessToJob(Long jobPostingId, Long companyId) {
        if (companyId == null) {
            throw new AccessDeniedException("Missing company context for recruiter request.");
        }
        JobSummaryDto job = getJobSummaryOrThrow(jobPostingId);
        if (!companyId.equals(job.companyId())) {
            throw new AccessDeniedException("Recruiter does not have access to this job posting.");
        }
    }

    public void assertRecruiterAccessToApplication(Long applicationId, Long companyId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));
        assertRecruiterAccessToJob(application.getJobPostingId(), companyId);
    }

    public boolean candidateHasApplicationsForCompany(Long candidateId, Long companyId) {
        if (candidateId == null || companyId == null) {
            return false;
        }
        List<Application> applications = applicationRepository.findByCandidateId(candidateId);
        if (applications.isEmpty()) {
            return false;
        }

        Map<Long, JobSummaryDto> jobCache = new HashMap<>();
        for (Application application : applications) {
            JobSummaryDto job = jobCache.computeIfAbsent(
                    application.getJobPostingId(),
                    this::getJobSummaryOrNull
            );
            if (job != null && companyId.equals(job.companyId())) {
                return true;
            }
        }
        return false;
    }

    private Map<Long, String> fetchCandidateNames(List<Long> candidateIds) {
        if (candidateIds == null || candidateIds.isEmpty()) {
            return Collections.emptyMap();
        }
        List<UserProfileDto> profiles =
                userProfileServiceClient.getProfilesInBatch(new UserProfileServiceClient.BatchUserIdsRequest(candidateIds));
        return profiles.stream()
                .collect(Collectors.toMap(UserProfileDto::userId, UserProfileDto::fullName));
    }

    private ApplicationDetailsDto enrichWithCandidateName(ApplicationDetailsDto dto, Map<Long, String> candidateNames) {
        dto.setCandidateName(candidateNames.get(dto.getCandidateId()));
        return dto;
    }

    private JobSummaryDto getJobSummaryOrThrow(Long jobPostingId) {
        JobSummaryDto job = getJobSummaryOrNull(jobPostingId);
        if (job == null) {
            throw new IllegalArgumentException("Job posting not found: " + jobPostingId);
        }
        return job;
    }

    private JobSummaryDto getJobSummaryOrNull(Long jobPostingId) {
        try {
            return jobServiceClient.getJobById(jobPostingId);
        } catch (feign.FeignException.NotFound ex) {
            log.warn("Job {} not found when validating access.", jobPostingId);
            return null;
        } catch (feign.FeignException ex) {
            log.error("Unable to retrieve job {} details from job service.", jobPostingId, ex);
            throw new IllegalStateException("Unable to retrieve job information. Please try again later.");
        }
    }

    private void publishStatusChangeEvent(Application app, ApplicationStatus oldStatus, Long changedByUserId) {
        var event = new ApplicationStatusChangedEvent(
                app.getId(),
                app.getCandidateId(),
                app.getJobPostingId(),
                oldStatus != null ? oldStatus.name() : null,
                app.getStatus().name(),
                changedByUserId
        );
        streamBridge.send("applicationStatusChanged-out-0", event);
        log.info("Published status change event for application {}: {} -> {}", app.getId(), oldStatus, app.getStatus());
    }
}
