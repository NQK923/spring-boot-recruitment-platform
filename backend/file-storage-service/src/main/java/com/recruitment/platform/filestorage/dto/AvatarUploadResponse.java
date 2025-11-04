package com.recruitment.platform.filestorage.dto;

import com.recruitment.platform.filestorage.model.FileMetadata;

import java.util.UUID;

public record AvatarUploadResponse(UUID fileId, String publicUrl) {

    public static AvatarUploadResponse from(FileMetadata metadata) {
        return new AvatarUploadResponse(metadata.getId(), metadata.getPublicUrl());
    }
}
