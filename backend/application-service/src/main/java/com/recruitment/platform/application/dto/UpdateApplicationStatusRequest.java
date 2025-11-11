package com.recruitment.platform.application.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record UpdateApplicationStatusRequest(
        String newStatus,
        InterviewPayload interview,
        OfferPayload offer
) {
    public record InterviewPayload(
            Instant scheduledAt,
            String timezone,
            String location,
            String instructions
    ) {
    }

    public record OfferPayload(
            BigDecimal salaryAmount,
            String currency,
            String notes,
            Instant expiresAt
    ) {
    }
}
