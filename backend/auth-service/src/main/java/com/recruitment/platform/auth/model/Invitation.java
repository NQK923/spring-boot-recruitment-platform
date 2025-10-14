package com.recruitment.platform.auth.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Getter
@Setter
@Table(name = "invitations")
public class Invitation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String email;
    private String token;
    private String roleToGrant;
    private Long companyId;
    private Instant expiresAt;
    private boolean isUsed = false;
    private Instant createdAt = Instant.now();
}
