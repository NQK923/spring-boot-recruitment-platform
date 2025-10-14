package com.recruitment.platform.userprofile.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
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

    // Getters and Setters
    public void setProfile(Profile profile) { this.profile = profile; }
    public void setFileId(UUID fileId) { this.fileId = fileId; }
    public void setVersionName(String versionName) { this.versionName = versionName; }
    public void setDefault(boolean isDefault) { this.isDefault = isDefault; }
}
