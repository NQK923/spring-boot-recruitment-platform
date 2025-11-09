package com.recruitment.platform.userprofile.service.prompt;

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
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Component
public class PromptFactory {

    private static final DateTimeFormatter MONTH_YEAR = DateTimeFormatter.ofPattern("MM/yyyy");

    private static final String PROMPT_TEMPLATE = """
Bạn là chuyên gia viết CV. Viết nội dung CV ngắn gọn, dùng tiếng %s, giọng điệu %s, đúng chính tả tiếng Việt có dấu.
ĐẦU RA CHỈ GỒM JSON THEO SCHEMA SAU, KHÔNG THÊM BẤT KỲ CHỮ NÀO BÊN NGOÀI:
{
  "fullName": string,
  "title": string,
  "summary": string,
  "links": { "linkedin": string?, "github": string?, "website": string? },
  "experiences": [{ "company": string, "title": string, "period": "MM/yyyy - MM/yyyy|Hiện tại", "bullets": [string,...], "tech": [string,...] }],
  "education": [{ "school": string, "degree": string, "period": "MM/yyyy - MM/yyyy|Hiện tại" }],
  "projects": [{ "name": string, "role": string, "bullets": [string,...], "tech": [string,...], "link": string? }],
  "certifications": [{ "name": string, "issuer": string, "issueDate": "MM/yyyy" }],
  "languages": [{ "language": string, "level": "A1|A2|B1|B2|C1|C2|Native|Fluent" }],
  "skills": [string,...]
}
NGUYÊN TẮC:
- Không bịa dữ liệu; chỉ dùng thông tin đã cung cấp ở phần DỮ LIỆU HỒ SƠ dưới đây.
- Dùng bullet bắt đầu bằng động từ mạnh (Thiết kế, Tối ưu, Triển khai, Dẫn dắt...), ưu tiên lượng hoá (%/số liệu).
- Nếu thiếu mục nào thì bỏ qua mục đó trong JSON (không để null/chuỗi rỗng).
- Format ngày tháng trong "period" là MM/yyyy - MM/yyyy hoặc "MM/yyyy - Hiện tại".
- Không thêm text giải thích, không kèm ```json.

DỮ LIỆU HỒ SƠ:
%s
""";

    public String build(Profile profile, String language, String tone) {
        String languageLabel = "en".equalsIgnoreCase(language) ? "English" : "tiếng Việt";
        String toneLabel = "formal".equalsIgnoreCase(tone) ? "trang trọng" : "trung lập";
        String dataBlock = buildDataBlock(profile);
        return PROMPT_TEMPLATE.formatted(languageLabel, toneLabel, dataBlock);
    }

    private String buildDataBlock(Profile profile) {
        StringBuilder builder = new StringBuilder();
        builder.append("- Họ tên: ").append(valueOrFallback(profile.getFullName(), "Chưa cập nhật")).append('\n');
        builder.append("- Vị trí mong muốn: ").append(valueOrFallback(profile.getDesiredPosition(), "Chưa cập nhật")).append('\n');
        builder.append("- Tóm tắt: ").append(valueOrFallback(profile.getSummary(), "Chưa có")).append('\n');
        builder.append("- Email: ").append(valueOrFallback(profile.getEmailForCv(), "Chưa cập nhật")).append('\n');
        builder.append("- Điện thoại: ").append(valueOrFallback(profile.getPhoneNumber(), "Chưa cập nhật")).append('\n');
        builder.append("- Địa điểm: ").append(valueOrFallback(profile.getLocation(), "Chưa cập nhật")).append('\n');
        builder.append("- Liên kết: LinkedIn=%s, GitHub=%s, Website=%s"
                .formatted(valueOrFallback(profile.getLinkedin(), "Chưa có"),
                        valueOrFallback(profile.getGithub(), "Chưa có"),
                        valueOrFallback(profile.getWebsite(), "Chưa có")))
                .append('\n');

        appendExperiences(builder, profile.getExperiences());
        appendProjects(builder, profile.getProjects());
        appendEducation(builder, profile.getEducation());
        appendSkills(builder, profile.getSkills());
        appendCertifications(builder, profile.getCertifications());
        appendLanguages(builder, profile.getLanguages());

        return builder.toString();
    }

    private void appendExperiences(StringBuilder builder, List<Experience> experiences) {
        if (experiences == null || experiences.isEmpty()) {
            return;
        }
        builder.append("- Kinh nghiệm:\n");
        experiences.stream()
                .sorted(Comparator.comparing(Experience::getStartDate, Comparator.nullsLast(Comparator.reverseOrder())))
                .forEach(exp -> {
                    builder.append("  + %s @ %s (%s)\n"
                            .formatted(valueOrFallback(exp.getTitle(), "Chưa rõ"),
                                    valueOrFallback(exp.getCompanyName(), "Ẩn danh"),
                                    formatPeriod(exp.getStartDate(), exp.getEndDate(), exp.isCurrent())));
                    if (StringUtils.hasText(exp.getDescription())) {
                        builder.append("    Mô tả: ").append(exp.getDescription().trim()).append('\n');
                    }
                    List<String> achievements = splitLines(exp.getAchievements());
                    if (!achievements.isEmpty()) {
                        builder.append("    Thành tựu: ").append(String.join(" | ", achievements)).append('\n');
                    }
                    if (exp.getTechStack() != null && !exp.getTechStack().isEmpty()) {
                        builder.append("    Công nghệ: ").append(String.join(", ", exp.getTechStack())).append('\n');
                    }
                });
    }

    private void appendProjects(StringBuilder builder, List<Project> projects) {
        if (projects == null || projects.isEmpty()) {
            return;
        }
        builder.append("- Dự án:\n");
        projects.stream()
                .sorted(Comparator.comparing(Project::getStartDate, Comparator.nullsLast(Comparator.reverseOrder())))
                .forEach(project -> {
                    builder.append("  + %s (%s) - Vai trò: %s\n"
                            .formatted(valueOrFallback(project.getName(), "Dự án"), formatPeriod(project.getStartDate(), project.getEndDate(), project.isCurrent()),
                                    valueOrFallback(project.getRole(), "Thành viên")));
                    if (StringUtils.hasText(project.getSummary())) {
                        builder.append("    Tóm tắt: ").append(project.getSummary().trim()).append('\n');
                    }
                    List<String> responsibilities = splitLines(project.getResponsibilities());
                    if (!responsibilities.isEmpty()) {
                        builder.append("    Nhiệm vụ: ").append(String.join(" | ", responsibilities)).append('\n');
                    }
                    List<String> achievements = splitLines(project.getAchievements());
                    if (!achievements.isEmpty()) {
                        builder.append("    Thành tựu: ").append(String.join(" | ", achievements)).append('\n');
                    }
                    if (project.getTechStack() != null && !project.getTechStack().isEmpty()) {
                        builder.append("    Công nghệ: ").append(String.join(", ", project.getTechStack())).append('\n');
                    }
                    if (StringUtils.hasText(project.getProjectUrl()) || StringUtils.hasText(project.getRepoUrl())) {
                        String link = StringUtils.hasText(project.getProjectUrl()) ? project.getProjectUrl() : project.getRepoUrl();
                        builder.append("    Liên kết: ").append(valueOrFallback(link, "Chưa có")).append('\n');
                    }
                });
    }

    private void appendEducation(StringBuilder builder, List<Education> educationList) {
        if (educationList == null || educationList.isEmpty()) {
            return;
        }
        builder.append("- Học vấn:\n");
        educationList.stream()
                .sorted(Comparator.comparing(Education::getStartDate, Comparator.nullsLast(Comparator.reverseOrder())))
                .forEach(edu -> builder.append("  + %s - %s (%s) GPA: %s\n"
                        .formatted(valueOrFallback(edu.getDegree(), "Bằng"), valueOrFallback(edu.getSchool(), "Trường"),
                                formatPeriod(edu.getStartDate(), edu.getEndDate(), false),
                                edu.getGpa() == null ? "Chưa cập nhật" : edu.getGpa().toPlainString())));
    }

    private void appendSkills(StringBuilder builder, List<Skill> skills) {
        if (skills == null || skills.isEmpty()) {
            return;
        }
        String joined = skills.stream()
                .sorted(Comparator.comparing(Skill::getSkillName, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)))
                .map(skill -> skill.getSkillName() + skillLevelSuffix(skill))
                .collect(Collectors.joining(", "));
        builder.append("- Kỹ năng: ").append(joined).append('\n');
    }

    private void appendCertifications(StringBuilder builder, List<Certification> certifications) {
        if (certifications == null || certifications.isEmpty()) {
            return;
        }
        builder.append("- Chứng chỉ:\n");
        certifications.stream()
                .sorted(Comparator.comparing(Certification::getIssueDate, Comparator.nullsLast(Comparator.reverseOrder())))
                .forEach(cert -> builder.append("  + %s - %s (%s)\n"
                        .formatted(valueOrFallback(cert.getName(), "Chứng chỉ"),
                                valueOrFallback(cert.getIssuer(), "Đơn vị cấp"),
                                formatIssueDate(cert.getIssueDate()))));
    }

    private void appendLanguages(StringBuilder builder, List<ProfileLanguage> languages) {
        if (languages == null || languages.isEmpty()) {
            return;
        }
        String joined = languages.stream()
                .map(lang -> "%s (%s)".formatted(lang.getLanguage(), lang.getProficiency()))
                .collect(Collectors.joining(", "));
        builder.append("- Ngoại ngữ: ").append(joined).append('\n');
    }

    private String formatPeriod(LocalDate start, LocalDate end, boolean current) {
        String startStr = start == null ? "??/????" : MONTH_YEAR.format(start);
        String endStr = (current || end == null) ? "Hiện tại" : MONTH_YEAR.format(end);
        return "%s - %s".formatted(startStr, endStr);
    }

    private String formatIssueDate(LocalDate issueDate) {
        return issueDate == null ? "Chưa rõ" : MONTH_YEAR.format(issueDate);
    }

    private List<String> splitLines(String value) {
        if (!StringUtils.hasText(value)) {
            return List.of();
        }
        return value.lines()
                .map(String::trim)
                .filter(line -> !line.isBlank())
                .collect(Collectors.toList());
    }

    private String skillLevelSuffix(Skill skill) {
        StringBuilder suffix = new StringBuilder();
        if (skill.getProficiency() != null) {
            suffix.append(" (").append(skill.getProficiency().name().toLowerCase(Locale.ROOT)).append(")");
        }
        if (skill.getYears() != null) {
            suffix.append(" - ").append(skill.getYears()).append(" năm");
        }
        return suffix.toString();
    }

    private String valueOrFallback(String value, String fallback) {
        return StringUtils.hasText(value) ? value.trim() : fallback;
    }
}
