package com.recruitment.platform.company.dto;

public record CreateCommunicationTemplateRequest(Long companyId,
                                                 String name,
                                                 String category,
                                                 String subject,
                                                 String body,
                                                 Boolean sharedWithRecruiters) {
}
