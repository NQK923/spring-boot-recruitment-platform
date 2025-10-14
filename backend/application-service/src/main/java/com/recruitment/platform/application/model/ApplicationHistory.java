package com.recruitment.platform.application.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "application_history")
public class ApplicationHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long applicationId;

    @Enumerated(EnumType.STRING)
    private ApplicationStatus fromStatus;

    @Enumerated(EnumType.STRING)
    private ApplicationStatus toStatus;

    private Long changedByUserId;

    private Instant timestamp = Instant.now();

    private String note;

    // Getters & Setters
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }
    public void setFromStatus(ApplicationStatus fromStatus) { this.fromStatus = fromStatus; }
    public void setToStatus(ApplicationStatus toStatus) { this.toStatus = toStatus; }
    public void setChangedByUserId(Long changedByUserId) { this.changedByUserId = changedByUserId; }
    public void setNote(String note) { this.note = note; }
}
