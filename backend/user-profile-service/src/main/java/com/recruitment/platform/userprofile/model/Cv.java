package com.recruitment.platform.userprofile.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Getter
@Setter
@Table(name = "cvs")
public class Cv {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_user_id")
    private Profile profile;

    private UUID fileId; // The ID returned by file-storage-service

    private String versionName;

    private boolean isDefault;

    private Instant createdAt = Instant.now();

}
