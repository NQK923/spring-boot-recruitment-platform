package com.recruitment.platform.application.dto;

import java.time.Instant;

public record UpdateApplicationTaskRequest(String title,
                                           String description,
                                           Instant dueDate,
                                           String status,
                                           Long assignedToUserId) {
}

