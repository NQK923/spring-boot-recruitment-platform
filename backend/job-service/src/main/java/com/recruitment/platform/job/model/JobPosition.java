package com.recruitment.platform.job.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "job_positions")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class JobPosition {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long companyId;
    private String title;
    private String department;
    private String level;
}
