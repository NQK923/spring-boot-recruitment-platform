package com.recruitment.platform.company.dto;

import com.recruitment.platform.company.model.CommunicationTemplate;

import java.time.Instant;

public record CommunicationTemplateResponse(Long id,
                                            Long companyId,
                                            String name,
                                            String category,
                                            String subject,
                                            String body,
                                            boolean sharedWithRecruiters,
                                            Long createdByUserId,
                                            Long updatedByUserId,
                                            Instant createdAt,
                                            Instant updatedAt) {

    public static CommunicationTemplateResponse fromEntity(CommunicationTemplate template) {
        return new CommunicationTemplateResponse(
                template.getId(),
                template.getCompanyId(),
                template.getName(),
                template.getCategory().name(),
                template.getSubject(),
                template.getBody(),
                template.isSharedWithRecruiters(),
                template.getCreatedByUserId(),
                template.getUpdatedByUserId(),
                template.getCreatedAt(),
                template.getUpdatedAt()
        );
    }
}
