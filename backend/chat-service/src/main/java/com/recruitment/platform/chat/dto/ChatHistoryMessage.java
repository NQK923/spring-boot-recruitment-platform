package com.recruitment.platform.chat.dto;

import jakarta.validation.constraints.NotBlank;

public record ChatHistoryMessage(
    @NotBlank String role,
    @NotBlank String content
) {
    public ChatHistoryMessage {
        if (role != null) {
            role = role.trim().toLowerCase();
        }
        if (content != null) {
            content = content.trim();
        }
    }
}
