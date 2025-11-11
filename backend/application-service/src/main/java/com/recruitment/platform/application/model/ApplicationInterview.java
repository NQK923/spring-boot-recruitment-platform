package com.recruitment.platform.application.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "application_interviews")
@Getter
@Setter
public class ApplicationInterview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long applicationId;

    private Instant scheduledAt;

    private String timezone;

    private String location;

    @Column(columnDefinition = "TEXT")
    private String instructions;

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
