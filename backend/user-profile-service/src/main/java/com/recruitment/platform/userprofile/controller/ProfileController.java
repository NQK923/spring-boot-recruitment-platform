package com.recruitment.platform.userprofile.controller;

import com.recruitment.platform.userprofile.dto.CertificationRequest;
import com.recruitment.platform.userprofile.dto.CvResponse;
import com.recruitment.platform.userprofile.dto.GenerateCvRequest;
import com.recruitment.platform.userprofile.dto.LanguageRequest;
import com.recruitment.platform.userprofile.dto.ProfileResponse;
import com.recruitment.platform.userprofile.dto.ProjectRequest;
import com.recruitment.platform.userprofile.dto.UpdateEnrichedProfileRequest;
import com.recruitment.platform.userprofile.dto.UpdateProfileRequest;
import com.recruitment.platform.userprofile.model.Certification;
import com.recruitment.platform.userprofile.model.ProfileLanguage;
import com.recruitment.platform.userprofile.model.Project;
import com.recruitment.platform.userprofile.service.ProfileService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/profiles")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/me")
    @PreAuthorize("hasAuthority('SCOPE_CANDIDATE')")
    public ResponseEntity<ProfileResponse> getMyProfile(@AuthenticationPrincipal Jwt jwt) {
        Long userId = Long.valueOf(jwt.getSubject());
        ProfileResponse profile = profileService.getOrCreateProfileView(userId);
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/me/enriched")
    @PreAuthorize("hasAuthority('SCOPE_CANDIDATE')")
    public ResponseEntity<ProfileResponse> getMyEnrichedProfile(@AuthenticationPrincipal Jwt jwt) {
        Long userId = Long.valueOf(jwt.getSubject());
        ProfileResponse profile = profileService.getOrCreateProfileView(userId);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/me")
    @PreAuthorize("hasAuthority('SCOPE_CANDIDATE')")
    public ResponseEntity<ProfileResponse> updateMyProfile(@AuthenticationPrincipal Jwt jwt,
                                                           @RequestBody UpdateProfileRequest request) {
        Long userId = Long.valueOf(jwt.getSubject());
        ProfileResponse updatedProfile = profileService.updateProfile(userId, request);
        return ResponseEntity.ok(updatedProfile);
    }

    @PutMapping("/me/enriched")
    @PreAuthorize("hasAuthority('SCOPE_CANDIDATE')")
    public ResponseEntity<ProfileResponse> updateMyProfileDetails(@AuthenticationPrincipal Jwt jwt,
                                                                  @RequestBody UpdateEnrichedProfileRequest request) {
        Long userId = Long.valueOf(jwt.getSubject());
        ProfileResponse updatedProfile = profileService.updateProfileDetails(userId, request);
        return ResponseEntity.ok(updatedProfile);
    }

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('SCOPE_CANDIDATE')")
    public ResponseEntity<ProfileResponse> uploadAvatar(@AuthenticationPrincipal Jwt jwt,
                                                        @RequestParam("file") MultipartFile file) {
        Long userId = Long.valueOf(jwt.getSubject());
        ProfileResponse profile = profileService.updateAvatar(userId, file);
        return ResponseEntity.ok(profile);
    }

    @PostMapping(value = "/me/cvs/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('SCOPE_CANDIDATE')")
    public ResponseEntity<CvResponse> uploadCv(@AuthenticationPrincipal Jwt jwt,
                                               @RequestParam("versionName") String versionName,
                                               @RequestParam("file") MultipartFile file) {
        Long userId = Long.valueOf(jwt.getSubject());
        CvResponse savedCv = profileService.uploadCv(userId, versionName, file);
        return new ResponseEntity<>(savedCv, HttpStatus.CREATED);
    }

    @GetMapping("/me/cvs")
    @PreAuthorize("hasAuthority('SCOPE_CANDIDATE')")
    public ResponseEntity<List<CvResponse>> getMyCvs(@AuthenticationPrincipal Jwt jwt) {
        Long userId = Long.valueOf(jwt.getSubject());
        return ResponseEntity.ok(profileService.listCvs(userId));
    }

    @PostMapping("/me/cvs/generate")
    @PreAuthorize("hasAuthority('SCOPE_CANDIDATE')")
    public ResponseEntity<CvResponse> generateCv(@AuthenticationPrincipal Jwt jwt,
                                                 @RequestBody GenerateCvRequest request) {
        Long userId = Long.valueOf(jwt.getSubject());
        CvResponse generatedCv = profileService.generateCv(userId, request.versionName());
        return new ResponseEntity<>(generatedCv, HttpStatus.CREATED);
    }

    @GetMapping("/me/projects")
    @PreAuthorize("hasAuthority('SCOPE_CANDIDATE')")
    public ResponseEntity<List<Project>> listMyProjects(@AuthenticationPrincipal Jwt jwt) {
        Long userId = Long.valueOf(jwt.getSubject());
        return ResponseEntity.ok(profileService.listProjects(userId));
    }

    @PostMapping("/me/projects")
    @PreAuthorize("hasAuthority('SCOPE_CANDIDATE')")
    public ResponseEntity<Project> createProject(@AuthenticationPrincipal Jwt jwt,
                                                 @RequestBody ProjectRequest request) {
        Long userId = Long.valueOf(jwt.getSubject());
        Project project = profileService.createProject(userId, request);
        return new ResponseEntity<>(project, HttpStatus.CREATED);
    }

    @PutMapping("/me/projects/{projectId}")
    @PreAuthorize("hasAuthority('SCOPE_CANDIDATE')")
    public ResponseEntity<Project> updateProject(@AuthenticationPrincipal Jwt jwt,
                                                 @PathVariable Long projectId,
                                                 @RequestBody ProjectRequest request) {
        Long userId = Long.valueOf(jwt.getSubject());
        Project project = profileService.updateProject(userId, projectId, request);
        return ResponseEntity.ok(project);
    }

    @DeleteMapping("/me/projects/{projectId}")
    @PreAuthorize("hasAuthority('SCOPE_CANDIDATE')")
    public ResponseEntity<Void> deleteProject(@AuthenticationPrincipal Jwt jwt,
                                              @PathVariable Long projectId) {
        Long userId = Long.valueOf(jwt.getSubject());
        profileService.deleteProject(userId, projectId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me/certifications")
    @PreAuthorize("hasAuthority('SCOPE_CANDIDATE')")
    public ResponseEntity<List<Certification>> listMyCertifications(@AuthenticationPrincipal Jwt jwt) {
        Long userId = Long.valueOf(jwt.getSubject());
        return ResponseEntity.ok(profileService.listCertifications(userId));
    }

    @PostMapping("/me/certifications")
    @PreAuthorize("hasAuthority('SCOPE_CANDIDATE')")
    public ResponseEntity<Certification> createCertification(@AuthenticationPrincipal Jwt jwt,
                                                             @RequestBody CertificationRequest request) {
        Long userId = Long.valueOf(jwt.getSubject());
        Certification certification = profileService.createCertification(userId, request);
        return new ResponseEntity<>(certification, HttpStatus.CREATED);
    }

    @PutMapping("/me/certifications/{certificationId}")
    @PreAuthorize("hasAuthority('SCOPE_CANDIDATE')")
    public ResponseEntity<Certification> updateCertification(@AuthenticationPrincipal Jwt jwt,
                                                             @PathVariable Long certificationId,
                                                             @RequestBody CertificationRequest request) {
        Long userId = Long.valueOf(jwt.getSubject());
        Certification certification = profileService.updateCertification(userId, certificationId, request);
        return ResponseEntity.ok(certification);
    }

    @DeleteMapping("/me/certifications/{certificationId}")
    @PreAuthorize("hasAuthority('SCOPE_CANDIDATE')")
    public ResponseEntity<Void> deleteCertification(@AuthenticationPrincipal Jwt jwt,
                                                    @PathVariable Long certificationId) {
        Long userId = Long.valueOf(jwt.getSubject());
        profileService.deleteCertification(userId, certificationId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me/languages")
    @PreAuthorize("hasAuthority('SCOPE_CANDIDATE')")
    public ResponseEntity<List<ProfileLanguage>> listMyLanguages(@AuthenticationPrincipal Jwt jwt) {
        Long userId = Long.valueOf(jwt.getSubject());
        return ResponseEntity.ok(profileService.listLanguages(userId));
    }

    @PostMapping("/me/languages")
    @PreAuthorize("hasAuthority('SCOPE_CANDIDATE')")
    public ResponseEntity<ProfileLanguage> createLanguage(@AuthenticationPrincipal Jwt jwt,
                                                          @RequestBody LanguageRequest request) {
        Long userId = Long.valueOf(jwt.getSubject());
        ProfileLanguage language = profileService.createLanguage(userId, request);
        return new ResponseEntity<>(language, HttpStatus.CREATED);
    }

    @PutMapping("/me/languages/{languageId}")
    @PreAuthorize("hasAuthority('SCOPE_CANDIDATE')")
    public ResponseEntity<ProfileLanguage> updateLanguage(@AuthenticationPrincipal Jwt jwt,
                                                          @PathVariable Long languageId,
                                                          @RequestBody LanguageRequest request) {
        Long userId = Long.valueOf(jwt.getSubject());
        ProfileLanguage language = profileService.updateLanguage(userId, languageId, request);
        return ResponseEntity.ok(language);
    }

    @DeleteMapping("/me/languages/{languageId}")
    @PreAuthorize("hasAuthority('SCOPE_CANDIDATE')")
    public ResponseEntity<Void> deleteLanguage(@AuthenticationPrincipal Jwt jwt,
                                               @PathVariable Long languageId) {
        Long userId = Long.valueOf(jwt.getSubject());
        profileService.deleteLanguage(userId, languageId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{userId}")
    @PreAuthorize("hasAnyAuthority('SCOPE_RECRUITER', 'SCOPE_COMPANY_ADMIN')")
    public ResponseEntity<ProfileResponse> getCandidateProfile(@PathVariable Long userId,
                                                               @RequestHeader("X-Company-ID") Long companyId) {
        if (!profileService.recruiterCanAccessCandidate(userId, companyId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return profileService.getProfileView(userId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/candidates/{userId}/profile")
    @PreAuthorize("hasAnyAuthority('SCOPE_RECRUITER', 'SCOPE_COMPANY_ADMIN')")
    public ResponseEntity<ProfileResponse> getCandidateProfileByRecruiter(@PathVariable Long userId,
                                                                          @RequestHeader("X-Company-ID") Long companyId) {
        return getCandidateProfile(userId, companyId);
    }
}
