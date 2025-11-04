package com.recruitment.platform.userprofile.client.dto;

import java.util.UUID;

public record AvatarUploadResponse(UUID fileId, String publicUrl) {
}
