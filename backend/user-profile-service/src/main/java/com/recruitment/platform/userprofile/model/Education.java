package com.recruitment.platform.userprofile.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@Table(name = "education")
public class Education {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String school;
    private String degree;
    private String major;
    private BigDecimal gpa;
    @Column(columnDefinition = "TEXT")
    private String honors;
    @Column(columnDefinition = "TEXT")
    private String activities;
    private LocalDate startDate;
    private LocalDate endDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_user_id", nullable = false)
    @JsonIgnore
    private Profile profile;
}
