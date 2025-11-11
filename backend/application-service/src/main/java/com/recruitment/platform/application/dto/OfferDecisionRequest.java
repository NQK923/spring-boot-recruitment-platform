package com.recruitment.platform.application.dto;

public record OfferDecisionRequest(
        Decision decision,
        String note
) {
    public enum Decision {
        ACCEPT, DECLINE
    }
}
