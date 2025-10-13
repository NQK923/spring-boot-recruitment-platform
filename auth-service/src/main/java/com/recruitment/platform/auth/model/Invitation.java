package com.recruitment.platform.auth.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
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

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getRoleToGrant() { return roleToGrant; }
    public void setRoleToGrant(String roleToGrant) { this.roleToGrant = roleToGrant; }
    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }
    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }
    public boolean isUsed() { return isUsed; }
    public void setUsed(boolean used) { isUsed = used; }
}
