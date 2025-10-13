package com.recruitment.platform.userprofile.controller;

import com.recruitment.platform.userprofile.model.Profile;
import com.recruitment.platform.userprofile.repository.ProfileRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profiles")
public class ProfileController {

    private final ProfileRepository repository;

    public ProfileController(ProfileRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/me")
    public ResponseEntity<Profile> getMyProfile(@AuthenticationPrincipal Jwt jwt) {
        Long userId = Long.valueOf(jwt.getSubject()); // In real app, subject should be user ID
        return repository.findById(userId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/me")
    public Profile createMyProfile(@AuthenticationPrincipal Jwt jwt, @RequestBody Profile profile) {
        Long userId = Long.valueOf(jwt.getSubject());
        profile.setUserId(userId);
        return repository.save(profile);
    }
}
