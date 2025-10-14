package com.recruitment.platform.application.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "applications")
public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long jobPostingId;
    private Long candidateId;
    private Long cvId;
    @Enumerated(EnumType.STRING)
    private ApplicationStatus status;
    private Instant appliedAt = Instant.now();
    // Getters & Setters
    public void setJobPostingId(Long jobPostingId) { this.jobPostingId = jobPostingId; }
    public void setCandidateId(Long candidateId) { this.candidateId = candidateId; }
    public void setCvId(Long cvId) { this.cvId = cvId; }
    public void setStatus(ApplicationStatus status) { this.status = status; }
}
