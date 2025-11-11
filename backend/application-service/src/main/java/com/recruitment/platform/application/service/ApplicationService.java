package com.recruitment.platform.application.service;

import com.recruitment.platform.application.client.JobServiceClient;
import com.recruitment.platform.application.client.UserProfileServiceClient;
import com.recruitment.platform.application.client.dto.JobSummaryDto;
import com.recruitment.platform.application.client.dto.UserProfileDto;
import com.recruitment.platform.application.dto.ApplicationDetailsDto;
import com.recruitment.platform.application.dto.ApplicationInterviewDetailsDto;
import com.recruitment.platform.application.dto.ApplicationOfferDetailsDto;
import com.recruitment.platform.application.dto.ApplyRequest;
import com.recruitment.platform.application.dto.OfferDecisionRequest;
import com.recruitment.platform.application.dto.UpdateApplicationStatusRequest;
import com.recruitment.platform.application.event.ApplicationStatusChangedEvent;
import com.recruitment.platform.application.model.Application;
import com.recruitment.platform.application.model.ApplicationInterview;
import com.recruitment.platform.application.model.ApplicationHistory;
import com.recruitment.platform.application.model.ApplicationNote;
import com.recruitment.platform.application.model.ApplicationOffer;
import com.recruitment.platform.application.model.ApplicationOfferStatus;
import com.recruitment.platform.application.model.ApplicationStatus;
import com.recruitment.platform.application.repository.ApplicationInterviewRepository;
import com.recruitment.platform.application.repository.ApplicationHistoryRepository;
import com.recruitment.platform.application.repository.ApplicationNoteRepository;
import com.recruitment.platform.application.repository.ApplicationOfferRepository;
import com.recruitment.platform.application.repository.ApplicationRepository;
import com.recruitment.platform.common.exception.NotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.stream.function.StreamBridge;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import java.time.format.DateTimeFormatter;

@Service
public class ApplicationService {

    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_INSTANT;
    private static final Logger log = LoggerFactory.getLogger(ApplicationService.class);
    private final ApplicationRepository applicationRepository;
    private final ApplicationHistoryRepository historyRepository;
    private final ApplicationNoteRepository noteRepository;
    private final ApplicationInterviewRepository applicationInterviewRepository;
    private final ApplicationOfferRepository applicationOfferRepository;
    private final StreamBridge streamBridge;
    private final UserProfileServiceClient userProfileServiceClient;
    private final JobServiceClient jobServiceClient;

    public ApplicationService(ApplicationRepository applicationRepository,
                              ApplicationHistoryRepository historyRepository,
                              ApplicationNoteRepository noteRepository,
                              ApplicationInterviewRepository applicationInterviewRepository,
                              ApplicationOfferRepository applicationOfferRepository,
                              StreamBridge streamBridge,
                              UserProfileServiceClient userProfileServiceClient,
                              JobServiceClient jobServiceClient) {
        this.applicationRepository = applicationRepository;
        this.historyRepository = historyRepository;
        this.noteRepository = noteRepository;
        this.applicationInterviewRepository = applicationInterviewRepository;
        this.applicationOfferRepository = applicationOfferRepository;
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
                .orElseThrow(() -> new NotFoundException("Application not found"));

        assertRecruiterAccessToJob(application.getJobPostingId(), companyId);

        ApplicationStatus oldStatus = application.getStatus();
        if (request.newStatus() == null) {
            throw new IllegalArgumentException("Thiếu trạng thái mới.");
        }
        ApplicationStatus newStatus = ApplicationStatus.valueOf(request.newStatus().toUpperCase());

        if (newStatus == ApplicationStatus.HIRED) {
            throw new IllegalStateException("Ứng viên phải tự xác nhận đề nghị để chuyển sang trạng thái ĐÃ TUYỂN.");
        }

        if (oldStatus == newStatus) {
            return application;
        }

        Map<String, Object> metadata = Map.of();

        if (newStatus == ApplicationStatus.INTERVIEWING) {
            ApplicationInterview interview = ensureInterviewPayload(applicationId, request.interview(), changedByUserId);
            metadata = buildInterviewMetadata(interview);
        } else if (newStatus == ApplicationStatus.OFFERED) {
            ApplicationOffer offer = ensureOfferPayload(applicationId, request.offer(), changedByUserId);
            metadata = buildOfferMetadata(offer);
        }

        application.setStatus(newStatus);
        Application savedApplication = applicationRepository.save(application);

        ApplicationHistory history = new ApplicationHistory();
        history.setApplicationId(applicationId);
        history.setFromStatus(oldStatus);
        history.setToStatus(newStatus);
        history.setChangedByUserId(changedByUserId);
        history.setNote(buildHistoryNote(newStatus, request));
        historyRepository.save(history);

        publishStatusChangeEvent(savedApplication, oldStatus, changedByUserId, metadata);

        return savedApplication;
    }

    @Transactional
    public Application assignOwner(Long applicationId,
                                   Long ownerUserId,
                                   Long requestedByUserId,
                                   Long companyId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new NotFoundException("Application not found"));

        assertRecruiterAccessToJob(application.getJobPostingId(), companyId);

        application.setOwnerUserId(ownerUserId);
        Application updated = applicationRepository.save(application);
        log.info("User {} updated owner of application {} to {}", requestedByUserId, applicationId, ownerUserId);
        return updated;
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
                .orElseThrow(() -> new NotFoundException("Application not found"));

        ApplicationNote note = new ApplicationNote();
        note.setApplicationId(application.getId());
        note.setAuthorUserId(authorUserId);
        note.setContent(content);
        return noteRepository.save(note);
    }

    @Transactional
    public Application respondToOffer(Long applicationId,
                                      OfferDecisionRequest request,
                                      Long candidateId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new NotFoundException("Application not found"));
        if (!Objects.equals(application.getCandidateId(), candidateId)) {
            throw new AccessDeniedException("Bạn không thể phản hồi đề nghị của hồ sơ khác.");
        }

        ApplicationOffer offer = applicationOfferRepository.findByApplicationId(applicationId)
                .orElseThrow(() -> new IllegalStateException("Chưa có đề nghị nào để phản hồi."));

        if (offer.getStatus() != ApplicationOfferStatus.PENDING) {
            throw new IllegalStateException("Đề nghị này đã được phản hồi trước đó.");
        }

        boolean accepted = request.decision() == OfferDecisionRequest.Decision.ACCEPT;
        offer.setStatus(accepted ? ApplicationOfferStatus.ACCEPTED : ApplicationOfferStatus.DECLINED);
        offer.setRespondedAt(Instant.now());
        offer.setRespondedByCandidateId(candidateId);
        offer.setDecisionNote(trimToNull(request.note()));
        offer.setUpdatedByUserId(candidateId);
        applicationOfferRepository.save(offer);

        ApplicationStatus oldStatus = application.getStatus();
        application.setStatus(accepted ? ApplicationStatus.HIRED : ApplicationStatus.REJECTED);
        Application saved = applicationRepository.save(application);

        ApplicationHistory history = new ApplicationHistory();
        history.setApplicationId(applicationId);
        history.setFromStatus(oldStatus);
        history.setToStatus(saved.getStatus());
        history.setChangedByUserId(candidateId);
        history.setNote(accepted ? "Ứng viên đã chấp nhận đề nghị." : "Ứng viên đã từ chối đề nghị.");
        historyRepository.save(history);

        Map<String, Object> metadata = buildOfferMetadata(offer);
        metadata.put("offerDecision", accepted ? "ACCEPTED" : "DECLINED");

        publishStatusChangeEvent(saved, oldStatus, candidateId, metadata);
        return saved;
    }

    public ApplicationDetailsDto getApplicationDetails(Long applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new NotFoundException("Application not found"));
        Map<Long, String> candidateNames = fetchCandidateNames(List.of(application.getCandidateId()));
        ApplicationDetailsDto dto = ApplicationDetailsDto.fromApplication(application);
        enrichWithCandidateName(dto, candidateNames);
        attachStageDetails(dto);
        return dto;
    }

    public Optional<ApplicationInterviewDetailsDto> getInterviewDetails(Long applicationId) {
        return applicationInterviewRepository.findByApplicationId(applicationId)
                .map(ApplicationInterviewDetailsDto::fromEntity);
    }

    public Optional<ApplicationOfferDetailsDto> getOfferDetails(Long applicationId) {
        return applicationOfferRepository.findByApplicationId(applicationId)
                .map(ApplicationOfferDetailsDto::fromEntity);
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
                .orElseThrow(() -> new NotFoundException("Application not found"));
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

    @Transactional(readOnly = true)
    public long countHiredApplications(Long jobPostingId) {
        if (jobPostingId == null) {
            return 0;
        }
        return applicationRepository.countByJobPostingIdAndStatus(jobPostingId, ApplicationStatus.HIRED);
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

    private ApplicationDetailsDto attachStageDetails(ApplicationDetailsDto dto) {
        applicationInterviewRepository.findByApplicationId(dto.getId())
                .map(ApplicationInterviewDetailsDto::fromEntity)
                .ifPresent(dto::setInterviewDetails);
        applicationOfferRepository.findByApplicationId(dto.getId())
                .map(ApplicationOfferDetailsDto::fromEntity)
                .ifPresent(dto::setOfferDetails);
        return dto;
    }

    private JobSummaryDto getJobSummaryOrThrow(Long jobPostingId) {
        JobSummaryDto job = getJobSummaryOrNull(jobPostingId);
        if (job == null) {
            throw new NotFoundException("Job posting not found: " + jobPostingId);
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
        publishStatusChangeEvent(app, oldStatus, changedByUserId, Map.of());
    }

    private void publishStatusChangeEvent(Application app,
                                          ApplicationStatus oldStatus,
                                          Long changedByUserId,
                                          Map<String, Object> metadata) {
        var event = new ApplicationStatusChangedEvent(
                app.getId(),
                app.getCandidateId(),
                app.getJobPostingId(),
                oldStatus != null ? oldStatus.name() : null,
                app.getStatus().name(),
                changedByUserId,
                metadata == null ? Map.of() : metadata
        );
        streamBridge.send("applicationStatusChanged-out-0", event);
        log.info("Published status change event for application {}: {} -> {}", app.getId(), oldStatus, app.getStatus());
    }

    private ApplicationInterview ensureInterviewPayload(Long applicationId,
                                                        UpdateApplicationStatusRequest.InterviewPayload payload,
                                                        Long changedByUserId) {
        if (payload == null || payload.scheduledAt() == null) {
            throw new IllegalArgumentException("Vui lòng cung cấp thời gian phỏng vấn.");
        }
        ApplicationInterview interview = applicationInterviewRepository.findByApplicationId(applicationId)
                .orElseGet(ApplicationInterview::new);
        interview.setApplicationId(applicationId);
        interview.setScheduledAt(payload.scheduledAt());
        interview.setTimezone(trimToNull(payload.timezone()));
        interview.setLocation(trimToNull(payload.location()));
        interview.setInstructions(trimToNull(payload.instructions()));
        if (interview.getId() == null) {
            interview.setCreatedByUserId(changedByUserId);
        }
        interview.setUpdatedByUserId(changedByUserId);
        return applicationInterviewRepository.save(interview);
    }

    private ApplicationOffer ensureOfferPayload(Long applicationId,
                                                UpdateApplicationStatusRequest.OfferPayload payload,
                                                Long changedByUserId) {
        if (payload == null || payload.salaryAmount() == null || payload.currency() == null) {
            throw new IllegalArgumentException("Vui lòng nhập mức lương và đơn vị tiền tệ cho đề nghị.");
        }
        if (payload.salaryAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Mức lương đề nghị phải lớn hơn 0.");
        }
        String normalizedCurrency = payload.currency().trim();
        if (normalizedCurrency.isEmpty()) {
            throw new IllegalArgumentException("Đơn vị tiền tệ không được để trống.");
        }
        ApplicationOffer offer = applicationOfferRepository.findByApplicationId(applicationId)
                .orElseGet(ApplicationOffer::new);
        offer.setApplicationId(applicationId);
        offer.setSalaryAmount(payload.salaryAmount());
        offer.setCurrency(normalizedCurrency.toUpperCase());
        offer.setNotes(trimToNull(payload.notes()));
        offer.setExpiresAt(payload.expiresAt());
        offer.setStatus(ApplicationOfferStatus.PENDING);
        offer.setRespondedAt(null);
        offer.setRespondedByCandidateId(null);
        offer.setDecisionNote(null);
        if (offer.getId() == null) {
            offer.setCreatedByUserId(changedByUserId);
        }
        offer.setUpdatedByUserId(changedByUserId);
        return applicationOfferRepository.save(offer);
    }

    private Map<String, Object> buildInterviewMetadata(ApplicationInterview interview) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("interviewScheduledAt", interview.getScheduledAt() != null ? interview.getScheduledAt().toString() : null);
        metadata.put("interviewTimezone", interview.getTimezone());
        metadata.put("interviewLocation", interview.getLocation());
        metadata.put("interviewInstructions", interview.getInstructions());
        return metadata;
    }

    private Map<String, Object> buildOfferMetadata(ApplicationOffer offer) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("offerSalaryAmount", offer.getSalaryAmount());
        metadata.put("offerCurrency", offer.getCurrency());
        metadata.put("offerNotes", offer.getNotes());
        metadata.put("offerExpiresAt", offer.getExpiresAt() != null ? offer.getExpiresAt().toString() : null);
        metadata.put("offerStatus", offer.getStatus().name());
        return metadata;
    }

    private String buildHistoryNote(ApplicationStatus status, UpdateApplicationStatusRequest request) {
        return switch (status) {
            case INTERVIEWING -> {
                var payload = request.interview();
                String scheduled = payload != null && payload.scheduledAt() != null
                        ? ISO_FORMATTER.format(payload.scheduledAt())
                        : "chưa rõ";
                yield "Đã lên lịch phỏng vấn lúc " + scheduled;
            }
            case OFFERED -> {
                var payload = request.offer();
                if (payload == null || payload.salaryAmount() == null) {
                    yield null;
                }
                String currency = payload.currency() != null ? payload.currency() : "";
                yield "Đã gửi đề nghị mức lương " + payload.salaryAmount() + " " + currency;
            }
            default -> null;
        };
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
