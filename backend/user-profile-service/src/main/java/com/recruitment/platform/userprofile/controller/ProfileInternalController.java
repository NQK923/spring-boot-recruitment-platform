package com.recruitment.platform.userprofile.controller;

import com.recruitment.platform.userprofile.dto.ProfileAvatarSyncRequest;
import com.recruitment.platform.userprofile.service.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/internal/profiles")
public class ProfileInternalController {

    private final ProfileService profileService;

    public ProfileInternalController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @PostMapping("/{userId}/avatar")
    public ResponseEntity<Void> syncAvatar(@PathVariable Long userId,
                                           @RequestBody ProfileAvatarSyncRequest request) {
        if (request == null || request.sourceUrl() == null || request.sourceUrl().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        profileService.syncAvatarFromExternalIfEmpty(userId, request.sourceUrl());
        return ResponseEntity.accepted().build();
    }
}
