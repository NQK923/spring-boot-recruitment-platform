package com.recruitment.platform.job.model;

import jakarta.persistence.*;

@Entity
@Table(name = "job_postings")
public class JobPosting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long companyId;
    private String title;
    private String description;
    @Enumerated(EnumType.STRING)
    private JobStatus status;
    // Getters & Setters
    public Long getId() { return id; }
    public String getTitle() { return title; }
    public JobStatus getStatus() { return status; }

}
