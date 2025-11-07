package com.recruitment.platform.chat.recommendation.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.recruitment.platform.chat.dto.job.JobDto;
import com.recruitment.platform.chat.dto.profile.ProfileDto;
import com.recruitment.platform.chat.recommendation.client.JobServiceClient;
import com.recruitment.platform.chat.recommendation.client.UserProfileServiceClient;
import com.recruitment.platform.chat.recommendation.repository.RecJobRepository;
import com.recruitment.platform.chat.recommendation.repository.RecProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RecommendationIndexer {

    private static final Logger LOG = LoggerFactory.getLogger(RecommendationIndexer.class);

    private final JobServiceClient jobServiceClient;
    private final UserProfileServiceClient profileServiceClient;
    private final RecJobRepository jobRepository;
    private final RecProfileRepository profileRepository;
    private final EmbeddingService embeddingService;
    private final ObjectMapper objectMapper;

    public RecommendationIndexer(JobServiceClient jobServiceClient,
                                 UserProfileServiceClient profileServiceClient,
                                 RecJobRepository jobRepository,
                                 RecProfileRepository profileRepository,
                                 EmbeddingService embeddingService,
                                 ObjectMapper objectMapper) {
        this.jobServiceClient = jobServiceClient;
        this.profileServiceClient = profileServiceClient;
        this.jobRepository = jobRepository;
        this.profileRepository = profileRepository;
        this.embeddingService = embeddingService;
        this.objectMapper = objectMapper;
    }

    public void upsertJob(Long jobId, String bearerToken) {
        if (jobId == null) {
            return;
        }
        JobDto job = jobServiceClient.getPublicJob(jobId, bearerToken);
        indexJob(job);
    }

    public void indexJob(JobDto job) {
        if (job == null || job.id() == null) {
            LOG.warn("Không có job hợp lệ để index.");
            return;
        }
        String content = buildJobContent(job);
        ObjectNode metadata = buildJobMetadata(job);
        float[] embedding = embeddingService.embedText(content);
        jobRepository.upsert(job.id(), job.companyId(), content, metadata, embedding);
    }

    public void upsertProfile(Long userId, String bearerToken) {
        if (userId == null) {
            return;
        }
        ProfileDto profile = profileServiceClient.getProfile(userId, bearerToken);
        if (profile == null) {
            LOG.warn("Không lấy được hồ sơ ứng viên {}", userId);
            return;
        }
        String summary = buildProfileSummary(profile);
        ObjectNode preferences = buildPreferences(profile);
        float[] embedding = embeddingService.embedText(summary);
        profileRepository.upsert(profile.userId(), null, summary, preferences, embedding);
    }

    String buildJobContent(JobDto job) {
        List<String> benefitList = splitToList(job.benefits());
        StringBuilder builder = new StringBuilder();
        builder.append(String.format("%s - %s%n", safe(job.title()), safe(job.companyName())));
        builder.append("Mô tả: ").append(safe(job.description())).append('\n');
        builder.append("Yêu cầu: ").append(safe(job.requirements())).append('\n');
        builder.append("Địa điểm: ").append(safe(job.location()))
            .append("; Hình thức làm việc: ").append(safe(job.workType())).append('\n');
        builder.append("Phúc lợi: ").append(benefitList.isEmpty() ? "Chưa cập nhật" : String.join(", ", benefitList)).append('\n');
        builder.append("Mức lương: ").append(safe(job.salaryRange()));
        return builder.toString();
    }

    ObjectNode buildJobMetadata(JobDto job) {
        ObjectNode node = objectMapper.createObjectNode();
        node.put("jobId", job.id());
        node.put("companyId", job.companyId());
        node.put("companyName", clean(job.companyName()));
        node.put("title", clean(job.title()));
        node.put("location", clean(job.location()));
        node.put("workType", clean(job.workType()));
        node.put("department", clean(job.department()));
        node.put("level", clean(job.level()));
        node.put("status", clean(job.status()));
        node.put("postedAt", job.postedAt() != null ? job.postedAt().toString() : null);
        node.put("jobUrl", clean(job.url()));
        node.put("salaryText", clean(job.salaryRange()));

        ArrayNode benefitsNode = node.putArray("benefits");
        splitToList(job.benefits()).forEach(benefitsNode::add);

        return node;
    }

    String buildProfileSummary(ProfileDto profile) {
        List<String> skillNames = extractSkills(profile);
        List<String> experiences = extractExperienceHighlights(profile);

        StringBuilder builder = new StringBuilder();
        builder.append("Tóm tắt: ").append(safe(profile.summary())).append('\n');
        if (!experiences.isEmpty()) {
            builder.append("Kinh nghiệm: ").append(String.join(" | ", experiences)).append('\n');
        }
        if (!skillNames.isEmpty()) {
            builder.append("Kỹ năng: ").append(String.join(", ", skillNames)).append('\n');
        }
        builder.append("Thông tin liên hệ: ").append(safe(profile.phoneNumber()));
        return builder.toString();
    }

    ObjectNode buildPreferences(ProfileDto profile) {
        ObjectNode node = objectMapper.createObjectNode();
        ArrayNode skillsNode = node.putArray("skills");
        extractSkills(profile).forEach(skillsNode::add);
        return node;
    }

    private List<String> extractSkills(ProfileDto profile) {
        if (profile.skills() == null) {
            return List.of();
        }
        return profile.skills().stream()
            .map(ProfileDto.Skill::skillName)
            .filter(StringUtils::hasText)
            .map(String::trim)
            .distinct()
            .collect(Collectors.toList());
    }

    private List<String> extractExperienceHighlights(ProfileDto profile) {
        if (profile.experiences() == null) {
            return List.of();
        }
        return profile.experiences().stream()
            .filter(exp -> StringUtils.hasText(exp.title()) || StringUtils.hasText(exp.companyName()))
            .map(exp -> {
                String title = safe(exp.title());
                String company = safe(exp.companyName());
                return title + " @ " + company;
            })
            .limit(3)
            .collect(Collectors.toList());
    }

    private List<String> splitToList(String raw) {
        if (!StringUtils.hasText(raw)) {
            return List.of();
        }
        return Arrays.stream(raw.split("[\\n;,]"))
            .map(String::trim)
            .filter(StringUtils::hasText)
            .limit(20)
            .collect(Collectors.toList());
    }

    private String safe(String value) {
        return StringUtils.hasText(value) ? value.trim() : "Chưa cập nhật";
    }

    private String clean(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }
}

