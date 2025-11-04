package com.recruitment.platform.userprofile.dto;

import java.time.Instant;

public record CvResponse(
        Long id,
        String versionName,
        boolean isDefault,
        Instant createdAt,
        String downloadUrl,
        String fileId,
        Long fileSize
) {
}
