package com.recruitment.platform.company.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Getter
@Setter
@Table(name = "companies")
public class Company {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String description;
    private String website;
    private String logoUrl;
    @Column(name = "config_json")
    private String configJson;
    private Instant createdAt = Instant.now();

}
