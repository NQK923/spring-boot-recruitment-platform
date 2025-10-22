package com.recruitment.platform.company.dto;

public record UpdateCommunicationTemplateRequest(String name,
                                                 String category,
                                                 String subject,
                                                 String body,
                                                 Boolean sharedWithRecruiters) {
}
