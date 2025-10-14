package com.recruitment.platform.auth.service;

import com.recruitment.platform.auth.client.CompanyServiceClient;
import com.recruitment.platform.auth.client.dto.AddUserToCompanyRequest;
import com.recruitment.platform.auth.client.dto.UserInvitedEvent; // Create this DTO
import com.recruitment.platform.auth.dto.AcceptInviteRequest;
import com.recruitment.platform.auth.dto.InternalInviteRequest;
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

    // ... other methods
}
