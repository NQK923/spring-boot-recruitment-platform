package com.recruitment.platform.application.dto;

import java.time.Instant;

public record CreateApplicationTaskRequest(String title,
                                           String description,
                                           Instant dueDate,
                                           Long assignedToUserId) {
}

