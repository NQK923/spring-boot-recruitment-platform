package com.recruitment.platform.userprofile.client.dto;

import java.util.UUID;

public record FileUploadResponse(
        UUID fileId,
        String originalName,
        String contentType,
        Long size,
        String storageBucket,
        String storagePath
) {
}
