package com.recruitment.platform.interview.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "interviews")
public class Interview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long applicationId;
    private Instant scheduledTime;
    // Getters & Setters
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }
    public void setScheduledTime(Instant scheduledTime) { this.scheduledTime = scheduledTime; }
}
