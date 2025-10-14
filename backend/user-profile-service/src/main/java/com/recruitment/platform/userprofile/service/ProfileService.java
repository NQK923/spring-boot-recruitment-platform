package com.recruitment.platform.userprofile.service;

import com.recruitment.platform.userprofile.dto.UpdateProfileRequest;
import com.recruitment.platform.userprofile.event.UserRegisteredEvent;
import com.recruitment.platform.userprofile.model.Profile;
import com.recruitment.platform.userprofile.repository.ProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class ProfileService {

    private static final Logger log = LoggerFactory.getLogger(ProfileService.class);
    private final ProfileRepository profileRepository;

    public ProfileService(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
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
    public Optional<Profile> updateProfile(Long userId, UpdateProfileRequest request) {
        return profileRepository.findById(userId).map(profile -> {
            profile.setFullName(request.fullName());
            profile.setPhoneNumber(request.phoneNumber());
            profile.setSummary(request.summary());
            return profileRepository.save(profile);
        });
    }
}
