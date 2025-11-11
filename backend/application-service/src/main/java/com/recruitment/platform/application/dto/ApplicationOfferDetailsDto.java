package com.recruitment.platform.application.dto;

import com.recruitment.platform.application.model.ApplicationOffer;
import com.recruitment.platform.application.model.ApplicationOfferStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationOfferDetailsDto {
    private BigDecimal salaryAmount;
    private String currency;
    private String notes;
    private ApplicationOfferStatus status;
    private Instant expiresAt;
    private Instant respondedAt;
    private Long respondedByCandidateId;
    private String decisionNote;

    public static ApplicationOfferDetailsDto fromEntity(ApplicationOffer offer) {
        return new ApplicationOfferDetailsDto(
                offer.getSalaryAmount(),
                offer.getCurrency(),
                offer.getNotes(),
                offer.getStatus(),
                offer.getExpiresAt(),
                offer.getRespondedAt(),
                offer.getRespondedByCandidateId(),
                offer.getDecisionNote()
        );
    }
}
