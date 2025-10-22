package com.recruitment.platform.application.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "application_tasks")
@Getter
@Setter
public class ApplicationTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long applicationId;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Instant dueDate;

    @Enumerated(EnumType.STRING)
    private ApplicationTaskStatus status = ApplicationTaskStatus.PENDING;

    private Long assignedToUserId;

    private Long createdByUserId;

    private Instant createdAt = Instant.now();

    private Instant completedAt;
}
