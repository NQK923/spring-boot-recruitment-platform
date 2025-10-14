package com.recruitment.platform.filestorage.repository;

import com.recruitment.platform.filestorage.model.FileMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface FileMetadataRepository extends JpaRepository<FileMetadata, UUID> {
}
