package com.recruitment.platform.application.dto;

import com.recruitment.platform.application.model.Application;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationDetailsDto {
    private Long id;
    private Long jobPostingId;
    private Long candidateId;
    private String candidateName;
    private Long ownerUserId;
    private Long cvId;
    private String status;
    private Instant appliedAt;
    private ApplicationInterviewDetailsDto interviewDetails;
    private ApplicationOfferDetailsDto offerDetails;

    public static ApplicationDetailsDto fromApplication(Application app) {
        return new ApplicationDetailsDto(
                app.getId(),
                app.getJobPostingId(),
                app.getCandidateId(),
                null,
                app.getOwnerUserId(),
                app.getCvId(),
                app.getStatus().name(),
                app.getAppliedAt(),
                null,
                null
        );
    }
}
