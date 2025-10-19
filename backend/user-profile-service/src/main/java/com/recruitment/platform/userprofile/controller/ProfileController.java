package com.recruitment.platform.userprofile.controller;

import com.recruitment.platform.userprofile.dto.GenerateCvRequest;
import com.recruitment.platform.userprofile.dto.UpdateProfileRequest;
import com.recruitment.platform.userprofile.model.Cv;
import com.recruitment.platform.userprofile.model.Profile;
import com.recruitment.platform.userprofile.service.ProfileService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
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
    public ResponseEntity<Profile> getMyProfile(@AuthenticationPrincipal Jwt jwt) {
        Long userId = Long.valueOf(jwt.getSubject());
        Profile profile = profileService.getOrCreateProfile(userId);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/me")
    @PreAuthorize("hasAuthority('SCOPE_CANDIDATE')")
    public ResponseEntity<Profile> updateMyProfile(@AuthenticationPrincipal Jwt jwt, @RequestBody UpdateProfileRequest request) {
        Long userId = Long.valueOf(jwt.getSubject());
        Profile updatedProfile = profileService.updateProfile(userId, request);
        return ResponseEntity.ok(updatedProfile);
    }

    @PostMapping(value = "/me/cvs/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('SCOPE_CANDIDATE')")
    public ResponseEntity<Cv> uploadCv(@AuthenticationPrincipal Jwt jwt,
                                       @RequestParam("versionName") String versionName,
                                       @RequestParam("file") MultipartFile file) {
        Long userId = Long.valueOf(jwt.getSubject());
        Cv savedCv = profileService.uploadCv(userId, versionName, file);
        return new ResponseEntity<>(savedCv, HttpStatus.CREATED);
    }

    @GetMapping("/me/cvs")
    @PreAuthorize("hasAuthority('SCOPE_CANDIDATE')")
    public ResponseEntity<List<Cv>> getMyCvs(@AuthenticationPrincipal Jwt jwt) {
        Long userId = Long.valueOf(jwt.getSubject());
        return ResponseEntity.ok(profileService.listCvs(userId));
    }

    @PostMapping("/me/cvs/generate")
    @PreAuthorize("hasAuthority('SCOPE_CANDIDATE')")
    public ResponseEntity<Cv> generateCv(@AuthenticationPrincipal Jwt jwt,
                                         @RequestBody GenerateCvRequest request) {
        Long userId = Long.valueOf(jwt.getSubject());
        Cv generatedCv = profileService.generateCv(userId, request.versionName());
        return new ResponseEntity<>(generatedCv, HttpStatus.CREATED);
    }

    @GetMapping("/{userId}")
    @PreAuthorize("hasAnyAuthority('SCOPE_RECRUITER', 'SCOPE_COMPANY_ADMIN')")
    public ResponseEntity<Profile> getCandidateProfile(@PathVariable Long userId) {
        // TODO: Add check to ensure the recruiter has access to this candidate's company applications
        return profileService.getProfile(userId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/candidates/{userId}/profile")
    @PreAuthorize("hasAnyAuthority('SCOPE_RECRUITER', 'SCOPE_COMPANY_ADMIN')")
    public ResponseEntity<Profile> getCandidateProfileByRecruiter(@PathVariable Long userId) {
        return getCandidateProfile(userId);
    }
}
