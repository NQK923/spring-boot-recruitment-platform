package com.recruitment.platform.application.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "application_offers")
@Getter
@Setter
public class ApplicationOffer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long applicationId;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal salaryAmount;

    @Column(nullable = false, length = 12)
    private String currency;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    private ApplicationOfferStatus status = ApplicationOfferStatus.PENDING;

    private Instant expiresAt;

    private Instant respondedAt;

    private Long respondedByCandidateId;

    @Column(columnDefinition = "TEXT")
    private String decisionNote;

    private Long createdByUserId;

    private Long updatedByUserId;

    private Instant createdAt;

    private Instant updatedAt;

    @PrePersist
    public void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
