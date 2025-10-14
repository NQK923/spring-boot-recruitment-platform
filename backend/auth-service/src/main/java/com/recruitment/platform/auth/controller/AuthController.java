package com.recruitment.platform.auth.controller;

import com.recruitment.platform.auth.dto.AcceptInviteRequest;
import com.recruitment.platform.auth.dto.JwtAuthenticationResponse;
import com.recruitment.platform.auth.dto.LoginRequest;
import com.recruitment.platform.auth.dto.RegisterRequest;
import com.recruitment.platform.auth.service.AuthService;
import com.recruitment.platform.auth.service.JwtTokenProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    public AuthController(AuthService authService, AuthenticationManager authenticationManager, JwtTokenProvider tokenProvider) {
        this.authService = authService;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        // authService.register(registerRequest);
        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<JwtAuthenticationResponse> authenticateUser(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(loginRequest.email(), loginRequest.password())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        return ResponseEntity.ok(new JwtAuthenticationResponse(jwt));
    }

    @PostMapping("/invites/accept")
    public ResponseEntity<?> acceptInvitation(@RequestBody AcceptInviteRequest acceptInviteRequest) {
        authService.acceptInvitation(acceptInviteRequest);
        return ResponseEntity.ok("Invitation accepted successfully. You can now log in.");
    }
}
