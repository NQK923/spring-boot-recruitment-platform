package com.recruitment.platform.userprofile.service;

import com.recruitment.platform.common.exception.BadRequestException;
import com.recruitment.platform.userprofile.client.ApplicationServiceClient;
import com.recruitment.platform.userprofile.client.FileStorageClient;
import com.recruitment.platform.userprofile.client.dto.AvatarUploadResponse;
import com.recruitment.platform.userprofile.client.dto.FileAvatarSyncRequest;
import com.recruitment.platform.userprofile.client.dto.FileUploadResponse;
import com.recruitment.platform.userprofile.dto.CvResponse;
import com.recruitment.platform.userprofile.dto.EducationRequest;
import com.recruitment.platform.userprofile.dto.ExperienceRequest;
import com.recruitment.platform.userprofile.dto.ProfileResponse;
import com.recruitment.platform.userprofile.dto.SkillRequest;
import com.recruitment.platform.userprofile.dto.UpdateProfileRequest;
import com.recruitment.platform.userprofile.event.UserRegisteredEvent;
import com.recruitment.platform.userprofile.model.Cv;
import com.recruitment.platform.userprofile.model.Education;
import com.recruitment.platform.userprofile.model.Experience;
import com.recruitment.platform.userprofile.model.Profile;
import com.recruitment.platform.userprofile.model.Skill;
import com.recruitment.platform.userprofile.repository.CvRepository;
import com.recruitment.platform.userprofile.repository.ProfileRepository;
import feign.FeignException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ProfileService {

    private static final Logger log = LoggerFactory.getLogger(ProfileService.class);

    private final ProfileRepository profileRepository;
    private final CvRepository cvRepository;
    private final ApplicationServiceClient applicationServiceClient;
    private final FileStorageClient fileStorageClient;

    public ProfileService(ProfileRepository profileRepository,
                          CvRepository cvRepository,
                          ApplicationServiceClient applicationServiceClient,
                          FileStorageClient fileStorageClient) {
        this.profileRepository = profileRepository;
        this.cvRepository = cvRepository;
        this.applicationServiceClient = applicationServiceClient;
        this.fileStorageClient = fileStorageClient;
    }

    public void createProfileForNewUser(UserRegisteredEvent event) {
        if (profileRepository.existsById(event.userId())) {
            log.warn("Profile for user ID {} already exists. Ignoring event.", event.userId());
            return;
        }

        Profile profile = new Profile();
        profile.setUserId(event.userId());
        profileRepository.save(profile);
        log.info("Created new profile for user ID: {}", event.userId());
    }

    public Optional<ProfileResponse> getProfileView(Long userId) {
        return profileRepository.findById(userId).map(this::mapProfile);
    }

    @Transactional(readOnly = true)
    public List<Profile> getProfilesInBatch(List<Long> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return List.of();
        }
        return profileRepository.findByUserIdIn(userIds);
    }

    @Transactional(readOnly = true)
    public ProfileResponse getOrCreateProfileView(Long userId) {
        return mapProfile(getOrCreateProfileEntity(userId));
    }

    @Transactional
    public ProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        Profile profile = getOrCreateProfileEntity(userId);

        if (request.fullName() != null) {
            profile.setFullName(request.fullName());
        }
        if (request.phoneNumber() != null) {
            profile.setPhoneNumber(request.phoneNumber());
        }
        if (request.summary() != null) {
            profile.setSummary(request.summary());
        }

        if (request.experiences() != null) {
            profile.getExperiences().clear();
            profile.getExperiences().addAll(mapExperiences(request.experiences()));
        }

        if (request.education() != null) {
            profile.getEducation().clear();
            profile.getEducation().addAll(mapEducation(request.education()));
        }

        if (request.skills() != null) {
            profile.getSkills().clear();
            profile.getSkills().addAll(mapSkills(request.skills()));
        }

        Profile saved = profileRepository.save(profile);
        return mapProfile(saved);
    }

    @Transactional
    public CvResponse uploadCv(Long userId, String versionName, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("CV file is required.");
        }

        Profile profile = getOrCreateProfileEntity(userId);
        FileUploadResponse uploadResponse = fileStorageClient.uploadFile(file);
        if (uploadResponse == null || uploadResponse.fileId() == null) {
            throw new IllegalStateException("Unable to persist CV file.");
        }

        List<Cv> existingCvs = cvRepository.findByProfile_UserId(userId);
        boolean shouldBeDefault = existingCvs.stream().noneMatch(Cv::isDefault);

        Cv cv = new Cv();
        cv.setProfile(profile);
        cv.setFileId(uploadResponse.fileId());
        cv.setStoragePath(uploadResponse.storagePath());
        cv.setStorageBucket(uploadResponse.storageBucket());
        cv.setFileSize(uploadResponse.size());
        cv.setVersionName(versionName);
        cv.setDefault(shouldBeDefault);

        Cv saved = cvRepository.save(cv);
        profile.getCvs().add(saved);
        return mapCv(saved);
    }

    public List<CvResponse> listCvs(Long userId) {
        return cvRepository.findByProfile_UserId(userId).stream()
                .sorted(Comparator.comparing(Cv::getCreatedAt).reversed())
                .map(this::mapCv)
                .toList();
    }

    @Transactional
    public CvResponse generateCv(Long userId, String versionName) {
        Profile profile = getOrCreateProfileEntity(userId);

        Cv cv = new Cv();
        cv.setProfile(profile);
        cv.setVersionName(versionName);
        cv.setDefault(false);

        Cv saved = cvRepository.save(cv);
        profile.getCvs().add(saved);
        return mapCv(saved);
    }

    public boolean recruiterCanAccessCandidate(Long candidateId, Long companyId) {
        if (candidateId == null || companyId == null) {
            return false;
        }
        try {
            Boolean result = applicationServiceClient.candidateHasApplicationsForCompany(candidateId, companyId);
            return Boolean.TRUE.equals(result);
        } catch (FeignException ex) {
            log.error("Failed to verify candidate {} access for company {}.", candidateId, companyId, ex);
            throw new IllegalStateException("Unable to verify recruiter access at this time.");
        }
    }

    @Transactional
    public ProfileResponse updateAvatar(Long userId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Avatar file is required.");
        }

        Profile profile = getOrCreateProfileEntity(userId);
        AvatarUploadResponse response = fileStorageClient.uploadAvatar(file);
        if (response == null || !StringUtils.hasText(response.publicUrl())) {
            throw new IllegalStateException("Unable to upload avatar.");
        }
        if (StringUtils.hasText(response.publicUrl())) {
            profile.setAvatarPath(response.publicUrl());
        }
        Profile saved = profileRepository.save(profile);
        return mapProfile(saved);
    }

    @Transactional
    public void syncAvatarFromExternalIfEmpty(Long userId, String sourceUrl, String fullName) {
        if (!StringUtils.hasText(sourceUrl) && !StringUtils.hasText(fullName)) {
            return;
        }
        Profile profile = getOrCreateProfileEntity(userId);
        try {
            if (StringUtils.hasText(sourceUrl) && !StringUtils.hasText(profile.getAvatarPath())) {
                AvatarUploadResponse response = fileStorageClient.syncAvatar(new FileAvatarSyncRequest(userId, sourceUrl));
                if (response != null && StringUtils.hasText(response.publicUrl())) {
                    profile.setAvatarPath(response.publicUrl());
                    log.info("Synced avatar for user {} from external provider.", userId);
                }
            }
            if (StringUtils.hasText(fullName) && !StringUtils.hasText(profile.getFullName())) {
                profile.setFullName(fullName);
            }
            if (StringUtils.hasText(profile.getAvatarPath()) || StringUtils.hasText(profile.getFullName())) {
                profileRepository.save(profile);
            }
        } catch (Exception ex) {
            log.warn("Failed to sync profile identity for user {}: {}", userId, ex.getMessage());
        }
    }

    private Profile getOrCreateProfileEntity(Long userId) {
        return profileRepository.findById(userId)
                .orElseGet(() -> {
                    Profile profile = new Profile();
                    profile.setUserId(userId);
                    return profileRepository.save(profile);
                });
    }

    private ProfileResponse mapProfile(Profile profile) {
        List<CvResponse> cvResponses = profile.getCvs().stream()
                .sorted(Comparator.comparing(Cv::getCreatedAt).reversed())
                .map(this::mapCv)
                .toList();
        return new ProfileResponse(
                profile.getUserId(),
                profile.getFullName(),
                profile.getPhoneNumber(),
                profile.getSummary(),
                profile.getAvatarPath(),
                profile.getExperiences(),
                profile.getEducation(),
                profile.getSkills(),
                cvResponses
        );
    }

    private CvResponse mapCv(Cv cv) {
        UUID fileId = cv.getFileId();
        String fileIdString = fileId != null ? fileId.toString() : null;
        return new CvResponse(
                cv.getId(),
                cv.getVersionName(),
                cv.isDefault(),
                cv.getCreatedAt(),
                null,
                fileIdString,
                cv.getFileSize()
        );
    }

    private List<Experience> mapExperiences(List<ExperienceRequest> requests) {
        List<Experience> experiences = new ArrayList<>();
        for (ExperienceRequest request : requests) {
            Experience experience = new Experience();
            experience.setTitle(request.title());
            experience.setCompanyName(request.companyName());
            experience.setDescription(request.description());
            experience.setStartDate(parseDate(request.startDate()));
            experience.setEndDate(parseDate(request.endDate()));
            experiences.add(experience);
        }
        return experiences;
    }

    private List<Education> mapEducation(List<EducationRequest> requests) {
        List<Education> education = new ArrayList<>();
        for (EducationRequest request : requests) {
            Education entry = new Education();
            entry.setSchool(request.school());
            entry.setDegree(request.degree());
            entry.setStartDate(parseDate(request.startDate()));
            entry.setEndDate(parseDate(request.endDate()));
            education.add(entry);
        }
        return education;
    }

    private List<Skill> mapSkills(List<SkillRequest> requests) {
        List<Skill> skills = new ArrayList<>();
        for (SkillRequest request : requests) {
            Skill skill = new Skill();
            skill.setSkillName(request.skillName());
            skills.add(skill);
        }
        return skills;
    }

    private LocalDate parseDate(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        try {
            return LocalDate.parse(value);
        } catch (Exception ex) {
            log.warn("Unable to parse date '{}': {}", value, ex.getMessage());
            return null;
        }
    }
}
