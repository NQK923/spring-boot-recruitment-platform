package com.recruitment.platform.job.model;

import jakarta.persistence.*;

@Entity
@Table(name = "job_positions")
public class JobPosition {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long companyId;
    private String title;
    private String department;
    private String level;

    // Getters & Setters
}
