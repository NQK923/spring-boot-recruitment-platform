package com.recruitment.platform.userprofile.service;

import com.recruitment.platform.userprofile.dto.ProfileMetricsResponse;
import com.recruitment.platform.userprofile.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfileMetricsService {

    private final ProfileRepository profileRepository;
    private final CvRepository cvRepository;
    private final ProjectRepository projectRepository;
    private final CertificationRepository certificationRepository;
    private final ProfileLanguageRepository profileLanguageRepository;

    public ProfileMetricsService(
            ProfileRepository profileRepository,
            CvRepository cvRepository,
            ProjectRepository projectRepository,
            CertificationRepository certificationRepository,
            ProfileLanguageRepository profileLanguageRepository
    ) {
        this.profileRepository = profileRepository;
        this.cvRepository = cvRepository;
        this.projectRepository = projectRepository;
        this.certificationRepository = certificationRepository;
        this.profileLanguageRepository = profileLanguageRepository;
    }

    @Transactional(readOnly = true)
    public ProfileMetricsResponse getSummary() {
        long totalProfiles = profileRepository.count();

        long withCv = cvRepository.countDistinctProfileUserId();
        long withAvatar = profileRepository.countByAvatarPathIsNotNull();
        long withProject = projectRepository.countDistinctProfileUserId();
        long withCertification = certificationRepository.countDistinctProfileUserId();
        long withLanguage = profileLanguageRepository.countDistinctProfileUserId();

        double avgCompletion = totalProfiles > 0
                ? (withCv + withAvatar + withProject + withCertification + withLanguage) * 20.0 / totalProfiles
                : 0.0;

        return new ProfileMetricsResponse(
                totalProfiles,
                withCv,
                withAvatar,
                withProject,
                withCertification,
                withLanguage,
                round(avgCompletion, 2)
        );
    }

    private double round(double value, int places) {
        double scale = Math.pow(10, places);
        return Math.round(value * scale) / scale;
    }
}