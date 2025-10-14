package com.recruitment.platform.job.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Getter
@Setter
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

}
