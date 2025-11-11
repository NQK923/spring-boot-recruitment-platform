package com.recruitment.platform.userprofile.controller;

import com.recruitment.platform.userprofile.dto.BatchUserIdsRequest;
import com.recruitment.platform.userprofile.dto.ProfileSummaryResponse;
import com.recruitment.platform.userprofile.service.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/internal/profiles")
public class InternalProfileController {

    private final ProfileService profileService;

    public InternalProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @PostMapping("/batch")
    public ResponseEntity<List<ProfileSummaryResponse>> getProfilesInBatch(@RequestBody BatchUserIdsRequest request) {
        return ResponseEntity.ok(profileService.getProfilesInBatch(request.userIds()));
    }
}
