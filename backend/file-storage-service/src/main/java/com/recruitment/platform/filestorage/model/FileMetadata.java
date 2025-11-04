package com.recruitment.platform.filestorage.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Getter
@Setter
@Table(name = "file_metadata")
public class FileMetadata {
    // Getters and Setters
    @Id
    private UUID id;
    private String originalName;
    private String contentType;
    private Long size;
    private Long uploaderId;
    private String storagePath;
    @Column(name = "storage_bucket")
    private String storageBucket;
    @Column(name = "public_file")
    private Boolean publicFile = Boolean.FALSE;
    @Column(name = "public_url")
    private String publicUrl;
    private Instant createdAt = Instant.now();

}
