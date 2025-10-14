package com.recruitment.platform.auth.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.recruitment.platform.auth.client.CompanyServiceClient;
import com.recruitment.platform.auth.client.dto.UserInvitedEvent;
import com.recruitment.platform.auth.dto.*;
import com.recruitment.platform.auth.event.UserRegisteredEvent;
import com.recruitment.platform.auth.model.Invitation;
import com.recruitment.platform.auth.model.Role;
import com.recruitment.platform.auth.model.User;
import com.recruitment.platform.auth.repository.InvitationRepository;
import com.recruitment.platform.auth.repository.RoleRepository;
import com.recruitment.platform.auth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.stream.function.StreamBridge;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AuthService {
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final InvitationRepository invitationRepository;
    private final RoleRepository roleRepository;
    private final CompanyServiceClient companyServiceClient;
    private final StreamBridge streamBridge;
    private final GoogleIdTokenVerifier googleVerifier;
    private final JwtTokenProvider tokenProvider;
    private final RestTemplate restTemplate;

    @Value("${spring.security.oauth2.client.registration.github.client-id}")
    private String githubClientId;

    @Value("${spring.security.oauth2.client.registration.github.client-secret}")
    private String githubClientSecret;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, InvitationRepository invitationRepository, RoleRepository roleRepository, CompanyServiceClient companyServiceClient, StreamBridge streamBridge, GoogleIdTokenVerifier googleVerifier, JwtTokenProvider tokenProvider, RestTemplate restTemplate) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.invitationRepository = invitationRepository;
        this.roleRepository = roleRepository;
        this.companyServiceClient = companyServiceClient;
        this.streamBridge = streamBridge;
        this.googleVerifier = googleVerifier;
        this.tokenProvider = tokenProvider;
        this.restTemplate = restTemplate;
    }

    public void createInvitation(InternalInviteRequest request) {
        Invitation invitation = new Invitation();
        invitation.setEmail(request.email());
        invitation.setCompanyId(request.companyId());
        invitation.setRoleToGrant(request.roleToGrant());
        invitation.setToken(UUID.randomUUID().toString());
        invitation.setExpiresAt(Instant.now().plus(48, ChronoUnit.HOURS));
        invitationRepository.save(invitation);

        // Send event to RabbitMQ
        UserInvitedEvent event = new UserInvitedEvent(invitation.getEmail(), invitation.getToken(), invitation.getRoleToGrant());
        boolean sent = streamBridge.send("userInvited-out-0", event);
        log.info("Sending UserInvitedEvent for email {}: {}", event.email(), sent ? "SUCCESS" : "FAILED");
    }

    @Transactional
    public User register(RegisterRequest request) {
        userRepository.findByEmail(request.email()).ifPresent(u -> {
            throw new IllegalStateException("Email already in use");
        });

        Role role = roleRepository.findByName("CANDIDATE")
                .orElseThrow(() -> new IllegalStateException("Default role CANDIDATE not found."));

        User user = new User();
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRoles(Set.of(role));
        user.setEmailVerifiedAt(Instant.now()); // Or implement email verification flow

        User savedUser = userRepository.save(user);

        // Send event for user registration
        UserRegisteredEvent event = new UserRegisteredEvent(savedUser.getId(), savedUser.getEmail());
        boolean sent = streamBridge.send("userRegistered-out-0", event);
        log.info("Sending UserRegisteredEvent for email {}: {}", event.email(), sent ? "SUCCESS" : "FAILED");

        return savedUser;
    }

    @Transactional
    public void acceptInvitation(AcceptInviteRequest request) {
        Invitation invitation = invitationRepository.findByToken(request.token())
                .orElseThrow(() -> new IllegalStateException("Invalid invitation token."));

        if (invitation.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalStateException("Invitation has expired.");
        }

        userRepository.findByEmail(invitation.getEmail()).ifPresent(u -> {
            throw new IllegalStateException("A user with this email already exists.");
        });

        Role role = roleRepository.findByName(invitation.getRoleToGrant())
                .orElseThrow(() -> new IllegalStateException("Role " + invitation.getRoleToGrant() + " not found."));

        User user = new User();
        user.setEmail(invitation.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRoles(Set.of(role));
        user.setEmailVerifiedAt(Instant.now());

        User savedUser = userRepository.save(user);

        // Add user to the company via Company Service
        companyServiceClient.addUserToCompany(new AddUserToCompanyRequest(invitation.getCompanyId(), savedUser.getId(), role.getName()));

        invitationRepository.delete(invitation);
        log.info("User {} created from invitation and added to company {}", savedUser.getEmail(), invitation.getCompanyId());
    }

    @Transactional
    public String processGoogleLogin(String idTokenString) throws GeneralSecurityException, IOException {
        GoogleIdToken idToken = googleVerifier.verify(idTokenString);
        if (idToken == null) {
            throw new IllegalArgumentException("Invalid ID token");
        }

        GoogleIdToken.Payload payload = idToken.getPayload();
        String email = payload.getEmail();

        User user = userRepository.findByEmail(email)
                .orElseGet(() -> createNewSocialUser(email, "google"));

        // Create an Authentication object for JWT generation
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                user.getEmail(),
                null, // No password for social login
                user.getRoles().stream()
                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role.getName()))
                        .collect(Collectors.toList())
        );

        return tokenProvider.generateToken(authentication);
    }

    @Transactional
    public String processGitHubLogin(String code) {
        // 1. Exchange code for access token
        String accessToken = getGitHubAccessToken(code);

        // 2. Get user info from GitHub
        GitHubUserResponse githubUser = getGitHubUser(accessToken);

        if (githubUser.email() == null) {
            // This can happen if the user's email is private. Handle this case.
            throw new IllegalStateException("Could not retrieve email from GitHub. Please make your email public.");
        }

        // 3. Find or create user in local DB
        User user = userRepository.findByEmail(githubUser.email())
                .orElseGet(() -> createNewSocialUser(githubUser.email(), "github"));

        // 4. Generate JWT
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                user.getEmail(),
                null, // No password for social login
                user.getRoles().stream()
                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role.getName()))
                        .collect(Collectors.toList())
        );

        return tokenProvider.generateToken(authentication);
    }

    private String getGitHubAccessToken(String code) {
        String url = "https://github.com/login/oauth/access_token";
        HttpHeaders headers = new HttpHeaders();
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

        Map<String, String> body = Map.of(
                "client_id", githubClientId,
                "client_secret", githubClientSecret,
                "code", code
        );

        HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);

        GitHubAccessTokenResponse response = restTemplate.postForObject(url, entity, GitHubAccessTokenResponse.class);

        if (response == null || response.accessToken() == null) {
            throw new IllegalStateException("Could not get GitHub access token");
        }
        return response.accessToken();
    }

    private GitHubUserResponse getGitHubUser(String accessToken) {
        String url = "https://api.github.com/user";
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        GitHubUserResponse response = restTemplate.exchange(url, HttpMethod.GET, entity, GitHubUserResponse.class).getBody();

        if (response == null) {
            throw new IllegalStateException("Could not get user info from GitHub");
        }
        return response;
    }

    private User createNewSocialUser(String email, String provider) {
        Role role = roleRepository.findByName("CANDIDATE")
                .orElseThrow(() -> new IllegalStateException("Default role CANDIDATE not found."));

        User user = new User();
        user.setEmail(email);
        user.setProvider(provider);
        user.setEmailVerifiedAt(Instant.now());
        user.setRoles(Set.of(role));
        // Social login users don't have a password in our system

        User savedUser = userRepository.save(user);

        // Publish event for user registration
        UserRegisteredEvent event = new UserRegisteredEvent(savedUser.getId(), savedUser.getEmail());
        boolean sent = streamBridge.send("userRegistered-out-0", event);
        log.info("Sending UserRegisteredEvent for new {} user {}: {}", provider, event.email(), sent ? "SUCCESS" : "FAILED");

        return savedUser;
    }

    public MeResponse getMe(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        return new MeResponse(
                user.getId(),
                user.getEmail(),
                user.getRoles().stream().map(Role::getName).collect(Collectors.toList())
        );
    }
}
