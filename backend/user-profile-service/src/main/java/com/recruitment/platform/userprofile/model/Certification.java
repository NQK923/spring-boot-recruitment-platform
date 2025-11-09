package com.recruitment.platform.userprofile.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@Table(name = "certifications")
public class Certification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_user_id")
    @JsonIgnore
    private Profile profile;

    private String name;
    private String issuer;
    private LocalDate issueDate;
    private LocalDate expireDate;
    private String credentialId;
    private String credentialUrl;
}
