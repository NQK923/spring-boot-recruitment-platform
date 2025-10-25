package com.recruitment.platform.userprofile.service;

import com.recruitment.platform.userprofile.dto.ProfileMetricsResponse;
import com.recruitment.platform.userprofile.repository.ProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfileMetricsService {

    private final ProfileRepository profileRepository;

    public ProfileMetricsService(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    @Transactional(readOnly = true)
    public ProfileMetricsResponse getSummary() {
        long totalProfiles = profileRepository.count();
        return new ProfileMetricsResponse(totalProfiles);
    }
}
