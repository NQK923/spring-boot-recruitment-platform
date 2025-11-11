package com.recruitment.platform.application.dto;

import com.recruitment.platform.application.model.ApplicationInterview;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationInterviewDetailsDto {
    private Instant scheduledAt;
    private String timezone;
    private String location;
    private String instructions;

    public static ApplicationInterviewDetailsDto fromEntity(ApplicationInterview interview) {
        return new ApplicationInterviewDetailsDto(
                interview.getScheduledAt(),
                interview.getTimezone(),
                interview.getLocation(),
                interview.getInstructions()
        );
    }
}
