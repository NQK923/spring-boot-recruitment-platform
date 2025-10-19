package com.recruitment.platform.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.recruitment.platform.auth.dto.*;
import com.recruitment.platform.auth.service.AuthService;
import com.recruitment.platform.auth.service.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final String googleClientId;
    private final String githubClientId;
    private final String githubRedirectUri;
    private final String githubAuthorizeRedirectUri;
    private final ObjectMapper objectMapper;

    public AuthController(AuthService authService,
                          AuthenticationManager authenticationManager,
                          JwtTokenProvider tokenProvider,
                          @Value("${spring.security.oauth2.client.registration.google.client-id:}") String googleClientId,
                          @Value("${spring.security.oauth2.client.registration.github.client-id:}") String githubClientId,
                          @Value("${app.oauth.github.redirect-uri:}") String githubRedirectUri,
                          @Value("${app.oauth.github.authorize-redirect-uri:}") String githubAuthorizeRedirectUri,
                          ObjectMapper objectMapper) {
        this.authService = authService;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.googleClientId = googleClientId;
        this.githubClientId = githubClientId;
        this.githubRedirectUri = githubRedirectUri;
        this.githubAuthorizeRedirectUri = githubAuthorizeRedirectUri;
        this.objectMapper = objectMapper;
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MeResponse> getMe(Principal principal) {
        return ResponseEntity.ok(authService.getMe(principal.getName()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        authService.register(registerRequest);
        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<JwtAuthenticationResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(loginRequest.email(), loginRequest.password())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        return ResponseEntity.ok(new JwtAuthenticationResponse(jwt));
    }

    @PostMapping("/oauth/google")
    public ResponseEntity<JwtAuthenticationResponse> googleLogin(@RequestBody GoogleLoginRequest loginRequest) throws GeneralSecurityException, IOException {
        String jwt = authService.processGoogleLogin(loginRequest.idToken());
        return ResponseEntity.ok(new JwtAuthenticationResponse(jwt));
    }

    @PostMapping("/oauth/github")
    public ResponseEntity<JwtAuthenticationResponse> githubLogin(@RequestBody GitHubLoginRequest loginRequest) {
        String jwt = authService.processGitHubLogin(loginRequest.code());
        return ResponseEntity.ok(new JwtAuthenticationResponse(jwt));
    }

    @GetMapping("/oauth/github/callback")
    public void githubCallback(@RequestParam(value = "code", required = false) String code,
                               @RequestParam(value = "state", required = false) String state,
                               @RequestParam(value = "error", required = false) String error,
                               @RequestParam(value = "error_description", required = false) String errorDescription,
                               HttpServletResponse response) throws IOException {
        if (state != null && state.startsWith("web")) {
            response.setStatus(HttpServletResponse.SC_OK);
            response.setContentType("text/html;charset=UTF-8");

            Map<String, Object> payload = new HashMap<>();
            payload.put("source", "github-auth");
            payload.put("state", state);
            if (code != null) {
                payload.put("code", code);
            }
            if (error != null) {
                payload.put("error", error);
            }
            if (errorDescription != null) {
                payload.put("error_description", errorDescription);
            }

            String jsonPayload = objectMapper.writeValueAsString(payload);
            try (var writer = response.getWriter()) {
                writer.append("<!DOCTYPE html><html><head><meta charset=\"UTF-8\"></head><body><script>");
                writer.append("if (window.opener) { window.opener.postMessage(")
                        .append(jsonPayload)
                        .append(", '*'); }");
                writer.append("window.close();");
                writer.append("</script></body></html>");
            }
            return;
        }

        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(githubRedirectUri);

        if (code != null) {
            builder.queryParam("code", code);
        }
        if (state != null) {
            builder.queryParam("state", state);
        }
        if (error != null) {
            builder.queryParam("error", error);
        }
        if (errorDescription != null) {
            builder.queryParam("error_description", errorDescription);
        }

        response.sendRedirect(builder.build(true).toUriString());
    }

    @GetMapping("/oauth/config")
    public ResponseEntity<OAuthConfigResponse> getOAuthConfig() {
        return ResponseEntity.ok(new OAuthConfigResponse(googleClientId, githubClientId, githubRedirectUri, githubAuthorizeRedirectUri));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestBody VerifyEmailRequest request) {
        authService.verifyEmail(request);
        return ResponseEntity.ok("Email verified successfully.");
    }

    @PostMapping("/invites/verify")
    public ResponseEntity<?> verifyInvitation(@RequestBody AcceptInviteRequest request) {
        authService.acceptInvitation(request);
        return ResponseEntity.ok("Invitation accepted successfully. You can now log in.");
    }

    @PostMapping("/invites/accept")
    public ResponseEntity<?> acceptInvitation(@RequestBody AcceptInviteRequest acceptInviteRequest) {
        authService.acceptInvitation(acceptInviteRequest);
        return ResponseEntity.ok("Invitation accepted successfully. You can now log in.");
    }
}
