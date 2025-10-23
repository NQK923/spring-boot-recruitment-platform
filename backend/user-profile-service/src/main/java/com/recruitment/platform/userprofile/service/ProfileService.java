package com.recruitment.platform.userprofile.service;

import com.recruitment.platform.userprofile.client.ApplicationServiceClient;
import com.recruitment.platform.userprofile.client.FileStorageClient;
import com.recruitment.platform.userprofile.dto.EducationRequest;
import com.recruitment.platform.userprofile.dto.ExperienceRequest;
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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ProfileService {

    private static final Logger log = LoggerFactory.getLogger(ProfileService.class);
    private final ProfileRepository profileRepository;
    private final CvRepository cvRepository;
    private final FileStorageClient fileStorageClient;
    private final ApplicationServiceClient applicationServiceClient;

    public ProfileService(ProfileRepository profileRepository,
                          CvRepository cvRepository,
                          FileStorageClient fileStorageClient,
                          ApplicationServiceClient applicationServiceClient) {
        this.profileRepository = profileRepository;
        this.cvRepository = cvRepository;
        this.fileStorageClient = fileStorageClient;
        this.applicationServiceClient = applicationServiceClient;
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

    public Optional<Profile> getProfile(Long userId) {
        return profileRepository.findById(userId);
    }

    @Transactional
    public Profile getOrCreateProfile(Long userId) {
        return profileRepository.findById(userId)
                .orElseGet(() -> {
                    Profile profile = new Profile();
                    profile.setUserId(userId);
                    return profileRepository.save(profile);
                });
    }

    public List<Profile> getProfilesInBatch(List<Long> userIds) {
        return profileRepository.findByUserIdIn(userIds);
    }

    @Transactional
    public Profile updateProfile(Long userId, UpdateProfileRequest request) {
        Profile profile = profileRepository.findById(userId)
                .orElseGet(() -> {
                    Profile newProfile = new Profile();
                    newProfile.setUserId(userId);
                    return newProfile;
                });

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

        return profileRepository.save(profile);
    }

    @Transactional
    public Cv uploadCv(Long userId, String versionName, MultipartFile file) {
        Profile profile = profileRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("Profile not found for user " + userId));

        List<Cv> existingCvs = cvRepository.findByProfile_UserId(userId);
        boolean shouldBeDefault = existingCvs.stream().noneMatch(Cv::isDefault);

        log.info("Uploading file for user {}", userId);
        UUID fileId = fileStorageClient.uploadFile(file);
        log.info("File uploaded successfully with ID: {}", fileId);

        Cv cv = new Cv();
        cv.setProfile(profile);
        cv.setFileId(fileId);
        cv.setVersionName(versionName);
        cv.setDefault(shouldBeDefault);

        return cvRepository.save(cv);
    }

    public List<Cv> listCvs(Long userId) {
        return cvRepository.findByProfile_UserId(userId);
    }

    @Transactional
    public Cv generateCv(Long userId, String versionName) {
        Profile profile = profileRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("Profile not found for user " + userId));

        Cv cv = new Cv();
        cv.setProfile(profile);
        cv.setVersionName(versionName);
        cv.setDefault(false);

        return cvRepository.save(cv);
    }

    public boolean recruiterCanAccessCandidate(Long candidateId, Long companyId) {
        if (candidateId == null || companyId == null) {
            return false;
        }
        try {
            Boolean result = applicationServiceClient.candidateHasApplicationsForCompany(candidateId, companyId);
            return Boolean.TRUE.equals(result);
        } catch (feign.FeignException ex) {
            log.error("Failed to verify candidate {} access for company {}.", candidateId, companyId, ex);
            throw new IllegalStateException("Unable to verify recruiter access at this time.");
        }
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
        if (value == null || value.isBlank()) {
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
