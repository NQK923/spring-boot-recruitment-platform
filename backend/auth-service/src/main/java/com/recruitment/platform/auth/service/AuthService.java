package com.recruitment.platform.auth.service;

import com.recruitment.platform.auth.client.CompanyServiceClient;
import com.recruitment.platform.auth.client.dto.AddUserToCompanyRequest;
import com.recruitment.platform.auth.client.dto.UserInvitedEvent;
import com.recruitment.platform.auth.dto.AcceptInviteRequest;
import com.recruitment.platform.auth.dto.InternalInviteRequest;
import com.recruitment.platform.auth.dto.RegisterRequest;
import com.recruitment.platform.auth.event.UserRegisteredEvent;
import com.recruitment.platform.auth.model.Invitation;
import com.recruitment.platform.auth.model.Role;
import com.recruitment.platform.auth.model.User;
import com.recruitment.platform.auth.repository.InvitationRepository;
import com.recruitment.platform.auth.repository.RoleRepository;
import com.recruitment.platform.auth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.stream.function.StreamBridge;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Set;
import java.util.UUID;

@Service
public class AuthService {
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final InvitationRepository invitationRepository;
    private final RoleRepository roleRepository;
    private final CompanyServiceClient companyServiceClient;
    private final StreamBridge streamBridge;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, InvitationRepository invitationRepository, RoleRepository roleRepository, CompanyServiceClient companyServiceClient, StreamBridge streamBridge) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.invitationRepository = invitationRepository;
        this.roleRepository = roleRepository;
        this.companyServiceClient = companyServiceClient;
        this.streamBridge = streamBridge;
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
}
