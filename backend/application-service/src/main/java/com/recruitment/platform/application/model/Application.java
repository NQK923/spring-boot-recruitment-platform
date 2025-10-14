package com.recruitment.platform.application.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Getter
@Setter
@Table(name = "applications")
public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    // Getters & Setters
    private Long jobPostingId;
    private Long candidateId;
    private Long cvId;
    @Enumerated(EnumType.STRING)
    private ApplicationStatus status;
    private Instant appliedAt = Instant.now();

}
