package com.recruitment.platform.userprofile.service.prompt;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.recruitment.platform.userprofile.model.Certification;
import com.recruitment.platform.userprofile.model.Education;
import com.recruitment.platform.userprofile.model.Experience;
import com.recruitment.platform.userprofile.model.Profile;
import com.recruitment.platform.userprofile.model.ProfileLanguage;
import com.recruitment.platform.userprofile.model.Project;
import com.recruitment.platform.userprofile.model.Skill;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Component
public class PromptFactory {

    private static final DateTimeFormatter PROMPT_DATE_FORMAT = DateTimeFormatter.ofPattern("MM/yyyy");

    private static final String PROMPT_TEMPLATE = """
Bạn là trợ lý nhân sự của TalentFlow. Hãy tạo CV chuẩn ATS bằng tiếng Việt trôi chảy với văn phong chuyên nghiệp, có số liệu minh họa cụ thể.
Nguyên tắc bắt buộc:
1. Giữ định dạng JSON đúng schema đã thống nhất (trả về duy nhất JSON, không được thêm giải thích).
2. Thông tin kinh nghiệm, dự án, kỹ năng phải đồng nhất ngày tháng theo định dạng MM/yyyy.
3. Ưu tiên liệt kê thành tựu dạng gạch đầu dòng với số liệu %, chi phí, thời gian, số người dùng.
4. Nếu thiếu dữ liệu, chỉ nêu ngắn gọn rằng mục đó chưa được cung cấp.

DỮ LIỆU HỒ SƠ:
%s
""";

    private final ObjectMapper objectMapper;

    public PromptFactory(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public String buildCvPrompt(Profile profile) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("profile", buildProfileMeta(profile));
        payload.put("experiences", profile.getExperiences().stream()
                .map(this::mapExperienceSection)
                .toList());
        payload.put("projects", profile.getProjects().stream()
                .map(this::mapProjectSection)
                .toList());
        payload.put("education", profile.getEducation().stream()
                .map(this::mapEducationSection)
                .toList());
        payload.put("skills", profile.getSkills().stream()
                .map(this::mapSkillSection)
                .toList());
        payload.put("certifications", profile.getCertifications().stream()
                .map(this::mapCertificationSection)
                .toList());
        payload.put("languages", profile.getLanguages().stream()
                .map(this::mapLanguageSection)
                .toList());

        try {
            String serialized = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(payload);
            return PROMPT_TEMPLATE.formatted(serialized);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Không thể tạo prompt CV do lỗi JSON.", e);
        }
    }

    private Map<String, Object> buildProfileMeta(Profile profile) {
        Map<String, Object> general = new LinkedHashMap<>();
        general.put("fullName", profile.getFullName());
        general.put("desiredPosition", profile.getDesiredPosition());
        general.put("summary", profile.getSummary());
        general.put("yearsOfExperience", profile.getYearsOfExperience());
        general.put("location", profile.getLocation());
        general.put("openToRelocate", profile.isOpenToRelocate());
        general.put("workAuthorization", profile.getWorkAuthorization());
        general.put("preferredCvLanguage", profile.getPreferredCvLanguage());
        general.put("contact", Map.of(
                "emailForCv", profile.getEmailForCv(),
                "phoneNumber", profile.getPhoneNumber()
        ));
        general.put("links", Map.of(
                "website", profile.getWebsite(),
                "linkedin", profile.getLinkedin(),
                "github", profile.getGithub(),
                "portfolio", profile.getPortfolio()
        ));
        return general;
    }

    private Map<String, Object> mapExperienceSection(Experience experience) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("title", experience.getTitle());
        data.put("companyName", experience.getCompanyName());
        data.put("location", experience.getLocation());
        data.put("employmentType", experience.getEmploymentType());
        data.put("startDate", formatDate(experience.getStartDate()));
        data.put("endDate", formatDate(experience.getEndDate()));
        data.put("isCurrent", experience.isCurrent());
        data.put("summary", experience.getDescription());
        data.put("achievements", splitLines(experience.getAchievements()));
        data.put("techStack", experience.getTechStack());
        return data;
    }

    private Map<String, Object> mapProjectSection(Project project) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("name", project.getName());
        data.put("role", project.getRole());
        data.put("summary", project.getSummary());
        data.put("responsibilities", splitLines(project.getResponsibilities()));
        data.put("achievements", splitLines(project.getAchievements()));
        data.put("techStack", project.getTechStack());
        data.put("projectUrl", project.getProjectUrl());
        data.put("repoUrl", project.getRepoUrl());
        data.put("startDate", formatDate(project.getStartDate()));
        data.put("endDate", formatDate(project.getEndDate()));
        data.put("isCurrent", project.isCurrent());
        return data;
    }

    private Map<String, Object> mapEducationSection(Education education) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("school", education.getSchool());
        data.put("degree", education.getDegree());
        data.put("major", education.getMajor());
        data.put("gpa", education.getGpa());
        data.put("honors", splitLines(education.getHonors()));
        data.put("activities", splitLines(education.getActivities()));
        data.put("startDate", formatDate(education.getStartDate()));
        data.put("endDate", formatDate(education.getEndDate()));
        return data;
    }

    private Map<String, Object> mapSkillSection(Skill skill) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("name", skill.getSkillName());
        data.put("proficiency", skill.getProficiency());
        data.put("years", skill.getYears());
        return data;
    }

    private Map<String, Object> mapCertificationSection(Certification certification) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("name", certification.getName());
        data.put("issuer", certification.getIssuer());
        data.put("issueDate", formatDate(certification.getIssueDate()));
        data.put("expireDate", formatDate(certification.getExpireDate()));
        data.put("credentialId", certification.getCredentialId());
        data.put("credentialUrl", certification.getCredentialUrl());
        return data;
    }

    private Map<String, Object> mapLanguageSection(ProfileLanguage language) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("language", language.getLanguage());
        data.put("proficiency", language.getProficiency());
        return data;
    }

    private String formatDate(LocalDate date) {
        if (date == null) {
            return null;
        }
        return PROMPT_DATE_FORMAT.format(date);
    }

    private List<String> splitLines(String value) {
        if (!StringUtils.hasText(value)) {
            return List.of();
        }
        return value.lines()
                .map(String::trim)
                .filter(line -> !line.isBlank())
                .map(line -> line.startsWith("- ") ? line.substring(2) : line)
                .map(line -> line.startsWith("•") ? line.substring(1).trim() : line)
                .collect(Collectors.toList());
    }
}
