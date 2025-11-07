package com.recruitment.platform.chat.dto.profile;

import java.util.List;

public record ProfileDto(
    Long userId,
    String fullName,
    String phoneNumber,
    String summary,
    String avatarUrl,
    List<Experience> experiences,
    List<Education> education,
    List<Skill> skills
) {

    public record Experience(
        Long id,
        String title,
        String companyName,
        String description,
        String startDate,
        String endDate
    ) {
    }

    public record Education(
        Long id,
        String school,
        String degree,
        String startDate,
        String endDate
    ) {
    }

    public record Skill(
        Long id,
        String skillName
    ) {
    }
}
