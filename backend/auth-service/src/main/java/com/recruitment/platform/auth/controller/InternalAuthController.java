package com.recruitment.platform.auth.controller;

import com.recruitment.platform.auth.dto.InternalInviteRequest;
import com.recruitment.platform.auth.dto.UserEmailInfo;
import com.recruitment.platform.auth.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// A DTO for the batch request
record BatchUserIdsRequest(List<Long> userIds) {}

@RestController
@RequestMapping("/api/internal/auth")
public class InternalAuthController {

    private final AuthService authService;

    public InternalAuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/invites")
    public ResponseEntity<?> createInvitation(@RequestBody InternalInviteRequest request) {
        authService.createInvitation(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/users/batch")
    public ResponseEntity<List<UserEmailInfo>> getUsersByIds(@RequestBody BatchUserIdsRequest request) {
        return ResponseEntity.ok(authService.getUsersByIds(request.userIds()));
    }
}
