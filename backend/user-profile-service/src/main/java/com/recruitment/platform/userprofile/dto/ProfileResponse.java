package com.recruitment.platform.userprofile.dto;

import com.recruitment.platform.userprofile.model.Certification;
import com.recruitment.platform.userprofile.model.Education;
import com.recruitment.platform.userprofile.model.Experience;
import com.recruitment.platform.userprofile.model.ProfileLanguage;
import com.recruitment.platform.userprofile.model.Project;
import com.recruitment.platform.userprofile.model.Skill;

import java.util.List;

public record ProfileResponse(
        Long userId,
        String fullName,
        String phoneNumber,
        String summary,
        String avatarUrl,
        String emailForCv,
        String location,
        String website,
        String linkedin,
        String github,
        String portfolio,
        Integer yearsOfExperience,
        String desiredPosition,
        String workAuthorization,
        Boolean openToRelocate,
        String preferredCvLanguage,
        List<Experience> experiences,
        List<Education> education,
        List<Skill> skills,
        List<Project> projects,
        List<Certification> certifications,
        List<ProfileLanguage> languages,
        List<CvResponse> cvs
) {
}
