package com.recruitment.platform.company.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "companies")
public class Company {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String description;
    private String website;
    private String logoUrl;
    private Instant createdAt = Instant.now();

    // Getters and Setters
    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    // ... other getters and setters
}
