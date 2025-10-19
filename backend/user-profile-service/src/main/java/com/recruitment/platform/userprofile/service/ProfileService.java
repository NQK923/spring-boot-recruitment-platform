package com.recruitment.platform.userprofile.service;

import com.recruitment.platform.userprofile.client.FileStorageClient;
import com.recruitment.platform.userprofile.dto.UpdateProfileRequest;
import com.recruitment.platform.userprofile.event.UserRegisteredEvent;
import com.recruitment.platform.userprofile.model.Cv;
import com.recruitment.platform.userprofile.model.Profile;
import com.recruitment.platform.userprofile.repository.CvRepository;
import com.recruitment.platform.userprofile.repository.ProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ProfileService {

    private static final Logger log = LoggerFactory.getLogger(ProfileService.class);
    private final ProfileRepository profileRepository;
    private final CvRepository cvRepository;
    private final FileStorageClient fileStorageClient;

    public ProfileService(ProfileRepository profileRepository, CvRepository cvRepository, FileStorageClient fileStorageClient) {
        this.profileRepository = profileRepository;
        this.cvRepository = cvRepository;
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

        profile.setFullName(request.fullName());
        profile.setPhoneNumber(request.phoneNumber());
        profile.setSummary(request.summary());

        return profileRepository.save(profile);
    }

    @Transactional
    public Cv uploadCv(Long userId, String versionName, MultipartFile file) {
        Profile profile = profileRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("Profile not found for user " + userId));

        log.info("Uploading file for user {}", userId);
        UUID fileId = fileStorageClient.uploadFile(file);
        log.info("File uploaded successfully with ID: {}", fileId);

        Cv cv = new Cv();
        cv.setProfile(profile);
        cv.setFileId(fileId);
        cv.setVersionName(versionName);
        // TODO: Add logic to handle the 'isDefault' flag
        cv.setDefault(true);

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
}
