package com.recruitment.platform.userprofile.service;

import com.recruitment.platform.common.exception.BadRequestException;
import com.recruitment.platform.userprofile.client.ApplicationServiceClient;
import com.recruitment.platform.userprofile.client.FileStorageClient;
import com.recruitment.platform.userprofile.client.dto.AvatarUploadResponse;
import com.recruitment.platform.userprofile.client.dto.FileUploadResponse;
import com.recruitment.platform.userprofile.dto.*;
import com.recruitment.platform.userprofile.event.UserRegisteredEvent;
import com.recruitment.platform.userprofile.model.*;
import com.recruitment.platform.userprofile.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProfileServiceTest {

    @Mock private ProfileRepository profileRepository;
    @Mock private CvRepository cvRepository;
    @Mock private ProjectRepository projectRepository;
    @Mock private CertificationRepository certificationRepository;
    @Mock private ProfileLanguageRepository profileLanguageRepository;
    @Mock private ApplicationServiceClient applicationServiceClient;
    @Mock private FileStorageClient fileStorageClient;

    @InjectMocks private ProfileService profileService;

    private Profile profile;
    private final Long userId = 100L;

    @BeforeEach
    void setUp() {
        profile = new Profile();
        profile.setUserId(userId);
        profile.setFullName("Nguyen Van A");
        profile.setPreferredCvLanguage("vi");
    }

    // === CREATE PROFILE FOR NEW USER ===
    @Test
    void shouldCreateProfileWhenNotExists() {
        when(profileRepository.existsById(userId)).thenReturn(false);
        when(profileRepository.save(any(Profile.class))).thenReturn(profile);

        profileService.createProfileForNewUser(new UserRegisteredEvent(userId));

        verify(profileRepository).save(argThat(p -> p.getUserId().equals(userId)));
    }

    @Test
    void shouldIgnoreIfProfileExists() {
        when(profileRepository.existsById(userId)).thenReturn(true);

        profileService.createProfileForNewUser(new UserRegisteredEvent(userId));

        verify(profileRepository, never()).save(any());
    }

    // === UPDATE PROFILE ===
    @Test
    void shouldUpdateProfileFields() {
        when(profileRepository.findById(userId)).thenReturn(Optional.of(profile));
        when(profileRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        UpdateProfileRequest request = new UpdateProfileRequest(
                "New Name", "0123456789", "Summary", null, null, null
        );

        ProfileResponse response = profileService.updateProfile(userId, request);

        assertThat(response.fullName()).isEqualTo("New Name");
        assertThat(response.phoneNumber()).isEqualTo("0123456789");
        verify(profileRepository).save(profile);
    }

    // === UPLOAD CV ===
    @Test
    void shouldUploadCvAndSetDefaultIfFirst() {
        when(profileRepository.findById(userId)).thenReturn(Optional.of(profile));
        when(fileStorageClient.uploadFile(any())).thenReturn(
                new FileUploadResponse(UUID.randomUUID(), "path", "bucket", 1024L)
        );
        when(cvRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        MultipartFile file = mock(MultipartFile.class);
        CvResponse cv = profileService.uploadCv(userId, "CV v1", file);

        assertThat(cv.isDefault()).isTrue();
        assertThat(profile.getCvs()).hasSize(1);
    }

    // === DELETE CV + AUTO SET DEFAULT ===
    @Test
    void shouldSetNextCvAsDefaultAfterDelete() {
        Cv cv1 = new Cv(); cv1.setId(1L); cv1.setDefault(true); cv1.setCreatedAt(LocalDate.now().minusDays(1));
        Cv cv2 = new Cv(); cv2.setId(2L); cv2.setDefault(false); cv2.setCreatedAt(LocalDate.now());

        profile.getCvs().addAll(List.of(cv1, cv2));

        when(cvRepository.findByIdAndProfile_UserId(1L, userId)).thenReturn(Optional.of(cv1));
        when(cvRepository.findByProfile_UserId(userId)).thenReturn(List.of(cv2));

        profileService.deleteCv(userId, 1L);

        verify(cvRepository).delete(cv1);
        assertThat(cv2.isDefault()).isTrue();
        verify(cvRepository).save(cv2);
    }

    // === CERTIFICATION CRUD ===
    @Test
    void shouldCreateCertification() {
        when(profileRepository.findById(userId)).thenReturn(Optional.of(profile));
        when(certificationRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        CertificationRequest req = new CertificationRequest(
                "AWS", "Amazon", "2023-01-01", null, "123", "https://cert.com"
        );

        Certification cert = profileService.createCertification(userId, req);

        assertThat(cert.getName()).isEqualTo("AWS");
        assertThat(cert.getProfile()).isEqualTo(profile);
    }

    @Test
    void shouldThrowWhenExpireBeforeIssue() {
        when(profileRepository.findById(userId)).thenReturn(Optional.of(profile));

        CertificationRequest req = new CertificationRequest(
                "Cert", "Issuer", "2024-01-01", "2023-01-01", null, null
        );

        assertThatThrownBy(() -> profileService.createCertification(userId, req))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("sau hoặc bằng");
    }

    // === RECRUITER ACCESS ===
    @Test
    void shouldAllowAccessIfHasApplication() {
        when(applicationServiceClient.candidateHasApplicationsForCompany(userId, 99L))
                .thenReturn(true);

        boolean allowed = profileService.recruiterCanAccessCandidate(userId, 99L);

        assertThat(allowed).isTrue();
    }

    // === AVATAR SYNC ===
    @Test
    void shouldSyncAvatarAndNameIfEmpty() {
        profile.setFullName(null);
        profile.setAvatarPath(null);
        when(profileRepository.findById(userId)).thenReturn(Optional.of(profile));
        when(fileStorageClient.syncAvatar(any())).thenReturn(
                new AvatarUploadResponse("https://avatar.com/new.jpg")
        );
        when(profileRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        profileService.syncAvatarFromExternalIfEmpty(userId, "https://old.com/avatar.jpg", "Synced Name");

        assertThat(profile.getFullName()).isEqualTo("Synced Name");
        assertThat(profile.getAvatarPath()).isEqualTo("https://avatar.com/new.jpg");
    }

    // === NORMALIZE TECH STACK ===
    @Test
    void shouldNormalizeTechStack() {
        List<String> input = List.of(" Java ", "java", "Spring Boot", null, "");
        List<String> normalized = profileService.normalizeTechStack(input);

        assertThat(normalized).hasSize(2)
                .containsExactly("Java", "Spring Boot");
    }
}