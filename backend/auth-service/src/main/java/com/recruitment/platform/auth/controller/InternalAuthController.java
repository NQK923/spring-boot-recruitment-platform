package com.recruitment.platform.auth.controller;

import com.recruitment.platform.auth.dto.InternalInviteRequest;
import com.recruitment.platform.auth.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
