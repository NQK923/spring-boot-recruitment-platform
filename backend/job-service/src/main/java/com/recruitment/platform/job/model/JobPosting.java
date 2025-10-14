package com.recruitment.platform.job.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "job_postings")
public class JobPosting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long companyId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_position_id")
    private JobPosition jobPosition;

    private String title;
    private String description;
    private String requirements;
    private String location;
    private String workType;

    @Enumerated(EnumType.STRING)
    private JobStatus status;

    private Long recruiterId;
    private Instant createdAt = Instant.now();
    private Instant updatedAt;

    // Getters & Setters
    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public JobStatus getStatus() { return status; }
}
