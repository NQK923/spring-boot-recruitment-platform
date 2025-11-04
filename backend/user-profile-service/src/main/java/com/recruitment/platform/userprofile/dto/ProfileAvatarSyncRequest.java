package com.recruitment.platform.userprofile.dto;

public record ProfileAvatarSyncRequest(
        String sourceUrl,
        String fullName
) {
}
