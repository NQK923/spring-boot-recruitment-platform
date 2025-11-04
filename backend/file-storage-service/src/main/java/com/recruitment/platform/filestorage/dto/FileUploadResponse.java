package com.recruitment.platform.filestorage.dto;

import com.recruitment.platform.filestorage.model.FileMetadata;

import java.util.UUID;

public record FileUploadResponse(
        UUID fileId,
        String originalName,
        String contentType,
        Long size,
        String storageBucket,
        String storagePath
) {
    public static FileUploadResponse from(FileMetadata metadata) {
        return new FileUploadResponse(
                metadata.getId(),
                metadata.getOriginalName(),
                metadata.getContentType(),
                metadata.getSize(),
                metadata.getStorageBucket(),
                metadata.getStoragePath()
        );
    }
}
