package com.recruitment.platform.auth.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeTokenRequest;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.recruitment.platform.auth.client.CompanyServiceClient;
import com.recruitment.platform.auth.client.dto.AddUserToCompanyRequest;
import com.recruitment.platform.auth.client.dto.UserInvitedEvent;
import com.recruitment.platform.auth.dto.*;
import com.recruitment.platform.auth.event.PasswordResetRequestedEvent;
import com.recruitment.platform.auth.event.UserRegisteredEvent;
import com.recruitment.platform.auth.model.EmailVerificationToken;
import com.recruitment.platform.auth.model.Invitation;
import com.recruitment.platform.auth.model.PasswordResetToken;
import com.recruitment.platform.auth.model.Role;
import com.recruitment.platform.auth.model.User;
import com.recruitment.platform.auth.repository.EmailVerificationTokenRepository;
import com.recruitment.platform.auth.repository.InvitationRepository;
import com.recruitment.platform.auth.repository.PasswordResetTokenRepository;
import com.recruitment.platform.auth.repository.RoleRepository;
import com.recruitment.platform.auth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.stream.function.StreamBridge;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AuthService {
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final SecureRandom OTP_RANDOM = new SecureRandom();
    private static final int OTP_LENGTH = 6;
    private static final long EMAIL_OTP_EXPIRY_MINUTES = 10;
    private static final long PASSWORD_RESET_EXPIRY_MINUTES = 10;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final InvitationRepository invitationRepository;
    private final RoleRepository roleRepository;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final CompanyServiceClient companyServiceClient;
    private final StreamBridge streamBridge;
    private final GoogleIdTokenVerifier googleVerifier;
    private final JwtTokenProvider tokenProvider;
    private final RestTemplate restTemplate;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String googleClientSecret;

    @Value("${spring.security.oauth2.client.registration.github.client-id}")
    private String githubClientId;

    @Value("${spring.security.oauth2.client.registration.github.client-secret}")
    private String githubClientSecret;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, InvitationRepository invitationRepository, RoleRepository roleRepository, EmailVerificationTokenRepository emailVerificationTokenRepository, PasswordResetTokenRepository passwordResetTokenRepository, CompanyServiceClient companyServiceClient, StreamBridge streamBridge, GoogleIdTokenVerifier googleVerifier, JwtTokenProvider tokenProvider, RestTemplate restTemplate) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.invitationRepository = invitationRepository;
        this.roleRepository = roleRepository;
        this.emailVerificationTokenRepository = emailVerificationTokenRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
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
        invitation.setCreatedByUserId(request.createdByUserId());
        invitation.setToken(UUID.randomUUID().toString());
        invitation.setExpiresAt(Instant.now().plus(48, ChronoUnit.HOURS));
        invitation.setUsed(false);
        invitationRepository.save(invitation);

        // Send event to RabbitMQ
        UserInvitedEvent event = new UserInvitedEvent(invitation.getEmail(), invitation.getToken(), invitation.getRoleToGrant());
        boolean sent = streamBridge.send("userInvited-out-0", event);
        log.info("Sending UserInvitedEvent for email {}: {}", event.email(), sent ? "SUCCESS" : "FAILED");
    }

    @Transactional(readOnly = true)
    public InvitationDetailsResponse getInvitationDetails(String token) {
        if (!StringUtils.hasText(token)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invitation token is required.");
        }

        String sanitizedToken = token.trim();

        Invitation invitation = invitationRepository.findByToken(sanitizedToken)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invitation token is invalid or has already been used."));

        if (invitation.isUsed()) {
            throw new ResponseStatusException(HttpStatus.GONE, "Invitation has already been accepted.");
        }

        if (invitation.getExpiresAt().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.GONE, "Invitation has expired.");
        }

        return new InvitationDetailsResponse(
                invitation.getEmail(),
                invitation.getRoleToGrant(),
                invitation.getCompanyId(),
                invitation.getExpiresAt()
        );
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
        user.setEmailVerifiedAt(null);

        User savedUser = userRepository.save(user);

        EmailVerificationToken verificationToken = createEmailVerificationToken(savedUser.getId());

        // Send event for user registration
        UserRegisteredEvent event = new UserRegisteredEvent(savedUser.getId(), savedUser.getEmail(), verificationToken.getToken(), verificationToken.getExpiresAt());
        boolean sent = streamBridge.send("userRegistered-out-0", event);
        log.info("Sending UserRegisteredEvent for email {}: {}", event.email(), sent ? "SUCCESS" : "FAILED");

        return savedUser;
    }

    @Transactional
    public void acceptInvitation(AcceptInviteRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invitation payload is required.");
        }

        String token = request.token() != null ? request.token().trim() : "";
        if (!StringUtils.hasText(token)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invitation token is required.");
        }

        String password = request.password();
        if (!StringUtils.hasText(password)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is required.");
        }

        if (password.length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 8 characters long.");
        }

        Invitation invitation = invitationRepository.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invitation token is invalid or has already been used."));

        if (invitation.isUsed()) {
            throw new ResponseStatusException(HttpStatus.GONE, "Invitation has already been accepted.");
        }

        if (invitation.getExpiresAt().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.GONE, "Invitation has expired.");
        }

        userRepository.findByEmail(invitation.getEmail()).ifPresent(existing -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists. Try resetting the password instead.");
        });

        Role role = roleRepository.findByName(invitation.getRoleToGrant())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Role " + invitation.getRoleToGrant() + " is not configured."));

        User user = new User();
        user.setEmail(invitation.getEmail());
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRoles(Set.of(role));
        user.setEmailVerifiedAt(Instant.now());

        User savedUser = userRepository.save(user);

        if (invitation.getCompanyId() != null) {
            try {
                companyServiceClient.addUserToCompany(new AddUserToCompanyRequest(savedUser.getId(), invitation.getCompanyId(), role.getName()));
            } catch (Exception ex) {
                log.error("Failed to attach invited user {} to company {}", savedUser.getEmail(), invitation.getCompanyId(), ex);
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Unable to attach the new user to the company. Please try again later.");
            }
        }

        invitation.setUsed(true);
        invitationRepository.save(invitation);

        UserRegisteredEvent event = new UserRegisteredEvent(savedUser.getId(), savedUser.getEmail(), null, null);
        boolean sent = streamBridge.send("userRegistered-out-0", event);
        log.info("New user {} accepted invitation. Company={}, eventDispatched={}", savedUser.getEmail(), invitation.getCompanyId(), sent ? "YES" : "NO");
    }

    @Transactional
    public String processGoogleIdToken(String idTokenString) throws GeneralSecurityException, IOException {
        return authenticateGoogleIdToken(idTokenString);
    }

    @Transactional
    public String processGoogleAuthorizationCode(String authorizationCode, String redirectUri) throws GeneralSecurityException, IOException {
        GoogleTokenResponse tokenResponse = new GoogleAuthorizationCodeTokenRequest(
                new NetHttpTransport(),
                GsonFactory.getDefaultInstance(),
                googleClientId,
                googleClientSecret,
                authorizationCode,
                redirectUri
        ).execute();

        String idToken = tokenResponse == null ? null : tokenResponse.getIdToken();
        if (!StringUtils.hasText(idToken)) {
            throw new IllegalStateException("Google authorization response did not include a valid ID token.");
        }

        return authenticateGoogleIdToken(idToken);
    }

    private String authenticateGoogleIdToken(String idTokenString) throws GeneralSecurityException, IOException {
        GoogleIdToken idToken = googleVerifier.verify(idTokenString);
        if (idToken == null) {
            throw new IllegalArgumentException("Invalid ID token");
        }

        GoogleIdToken.Payload payload = idToken.getPayload();
        String email = payload.getEmail();

        return loginOrCreateSocialUser(email, "google");
    }

    private String loginOrCreateSocialUser(String email, String provider) {
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> createNewSocialUser(email, provider));
        return issueSocialJwt(user);
    }

    private String issueSocialJwt(User user) {
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                user.getEmail(),
                null,
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

        return issueSocialJwt(user);
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
        UserRegisteredEvent event = new UserRegisteredEvent(savedUser.getId(), savedUser.getEmail(), null, null);
        boolean sent = streamBridge.send("userRegistered-out-0", event);
        log.info("Sending UserRegisteredEvent for new {} user {}: {}", provider, event.email(), sent ? "SUCCESS" : "FAILED");

        return savedUser;
    }

    public MeResponse getMe(String principalName) {
        Optional<User> userOptional;
        try {
            Long userId = Long.parseLong(principalName);
            userOptional = userRepository.findById(userId);
        } catch (NumberFormatException ex) {
            userOptional = userRepository.findByEmail(principalName);
        }

        User user = userOptional
                .orElseThrow(() -> new IllegalStateException("User not found"));

        return new MeResponse(
                user.getId(),
                user.getEmail(),
                user.getRoles().stream().map(Role::getName).collect(Collectors.toList())
        );
    }

    @Transactional
    public void verifyEmail(VerifyEmailRequest request) {
        Objects.requireNonNull(request, "request must not be null");

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalStateException("No user found with the provided email."));

        if (user.getEmailVerifiedAt() != null) {
            throw new IllegalStateException("Email already verified.");
        }

        EmailVerificationToken token = emailVerificationTokenRepository.findByUserIdAndToken(user.getId(), request.otp())
                .orElseThrow(() -> new IllegalArgumentException("Invalid verification code."));

        if (token.isUsed()) {
            throw new IllegalStateException("Verification code already used.");
        }

        if (token.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalStateException("Verification code has expired.");
        }

        user.setEmailVerifiedAt(Instant.now());
        userRepository.save(user);

        token.setUsed(true);
        emailVerificationTokenRepository.save(token);
    }

    @Transactional
    public void resendEmailVerificationOtp(ResendEmailOtpRequest request) {
        Objects.requireNonNull(request, "request must not be null");

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalStateException("No user found with the provided email."));

        if (user.getEmailVerifiedAt() != null) {
            throw new IllegalStateException("Email already verified.");
        }

        EmailVerificationToken newToken = createEmailVerificationToken(user.getId());
        UserRegisteredEvent event = new UserRegisteredEvent(user.getId(), user.getEmail(), newToken.getToken(), newToken.getExpiresAt());
        boolean sent = streamBridge.send("userRegistered-out-0", event);
        log.info("Resent verification OTP for email {}: {}", user.getEmail(), sent ? "SUCCESS" : "FAILED");
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        Objects.requireNonNull(request, "request must not be null");

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalStateException("No user found with the provided email."));

        if (user.getEmailVerifiedAt() == null) {
            throw new IllegalStateException("Email must be verified before resetting password.");
        }

        PasswordResetToken resetToken = createPasswordResetToken(user.getId());
        PasswordResetRequestedEvent event = new PasswordResetRequestedEvent(user.getId(), user.getEmail(), resetToken.getToken(), resetToken.getExpiresAt());
        boolean sent = streamBridge.send("passwordResetRequested-out-0", event);
        log.info("Issued password reset OTP for email {}: {}", user.getEmail(), sent ? "SUCCESS" : "FAILED");
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        Objects.requireNonNull(request, "request must not be null");

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalStateException("No user found with the provided email."));

        PasswordResetToken token = passwordResetTokenRepository.findByUserIdAndToken(user.getId(), request.otp())
                .orElseThrow(() -> new IllegalArgumentException("Invalid reset code."));

        if (token.isUsed()) {
            throw new IllegalStateException("Reset code already used.");
        }

        if (token.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalStateException("Reset code has expired.");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        token.setUsed(true);
        passwordResetTokenRepository.save(token);
    }

    public List<UserEmailInfo> getUsersByIds(List<Long> userIds) {
        return userRepository.findByIdIn(userIds).stream()
                .map(user -> new UserEmailInfo(user.getId(), user.getEmail()))
                .collect(Collectors.toList());
    }

    private EmailVerificationToken createEmailVerificationToken(Long userId) {
        emailVerificationTokenRepository.deleteByUserId(userId);

        EmailVerificationToken token = new EmailVerificationToken();
        token.setUserId(userId);
        token.setToken(generateUniqueEmailOtp());
        token.setExpiresAt(Instant.now().plus(EMAIL_OTP_EXPIRY_MINUTES, ChronoUnit.MINUTES));
        token.setUsed(false);

        return emailVerificationTokenRepository.save(token);
    }

    private PasswordResetToken createPasswordResetToken(Long userId) {
        passwordResetTokenRepository.deleteByUserId(userId);

        PasswordResetToken token = new PasswordResetToken();
        token.setUserId(userId);
        token.setToken(generateUniquePasswordOtp());
        token.setExpiresAt(Instant.now().plus(PASSWORD_RESET_EXPIRY_MINUTES, ChronoUnit.MINUTES));
        token.setUsed(false);

        return passwordResetTokenRepository.save(token);
    }

    private String generateUniqueEmailOtp() {
        String otp;
        do {
            otp = generateNumericOtp();
        } while (emailVerificationTokenRepository.findByToken(otp).isPresent());
        return otp;
    }

    private String generateUniquePasswordOtp() {
        String otp;
        do {
            otp = generateNumericOtp();
        } while (passwordResetTokenRepository.findByToken(otp).isPresent());
        return otp;
    }

    private String generateNumericOtp() {
        int min = (int) Math.pow(10, OTP_LENGTH - 1);
        int bound = (int) Math.pow(10, OTP_LENGTH);
        int randomNumber = OTP_RANDOM.nextInt(bound - min) + min;
        return String.format("%0" + OTP_LENGTH + "d", randomNumber);
    }
}
