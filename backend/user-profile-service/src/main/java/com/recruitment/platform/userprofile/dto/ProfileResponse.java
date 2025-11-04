package com.recruitment.platform.userprofile.dto;

import com.recruitment.platform.userprofile.model.Education;
import com.recruitment.platform.userprofile.model.Experience;
import com.recruitment.platform.userprofile.model.Skill;

import java.util.List;

public record ProfileResponse(
        Long userId,
        String fullName,
        String phoneNumber,
        String summary,
        String avatarUrl,
        List<Experience> experiences,
        List<Education> education,
        List<Skill> skills,
        List<CvResponse> cvs
) {
}
