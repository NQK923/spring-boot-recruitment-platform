package com.recruitment.platform.interview.dto;

import java.time.Instant;

public record UpdateInterviewRequest(
        Instant scheduleTime,
        String timezone,
        String format,
        String locationOrLink
) {
}
