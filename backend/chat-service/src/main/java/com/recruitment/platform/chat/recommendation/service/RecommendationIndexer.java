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

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
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

    public void upsertJob(UUID jobId, String bearerToken) {
        JobDto job = jobServiceClient.getPublicJob(jobId, bearerToken);
        if (job == null) {
            LOG.warn("Không tìm thấy job {} để index.", jobId);
            return;
        }
        String content = buildJobContent(job);
        ObjectNode metadata = buildJobMetadata(job);
        float[] embedding = embeddingService.embedText(content);
        jobRepository.upsert(job.id(), job.companyId(), content, metadata, embedding);
    }

    public void upsertProfile(UUID userId, String bearerToken) {
        ProfileDto profile = profileServiceClient.getProfile(userId, bearerToken);
        if (profile == null) {
            LOG.warn("Không lấy được hồ sơ ứng viên {}", userId);
            return;
        }
        String summary = buildProfileSummary(profile);
        ObjectNode preferences = buildPreferences(profile);
        float[] embedding = embeddingService.embedText(summary);
        profileRepository.upsert(profile.userId(), profile.companyId(), summary, preferences, embedding);
    }

    String buildJobContent(JobDto job) {
        StringBuilder builder = new StringBuilder();
        builder.append(String.format("%s – %s%n", safe(job.title()), safe(job.companyName())));
        builder.append("Mô tả: ").append(safe(job.description())).append('\n');
        builder.append("Yêu cầu: ").append(safe(job.requirements())).append('\n');
        builder.append("Kỹ năng: ").append(String.join(", ", emptyToPlaceholder(job.skills()))).append('\n');
        builder.append("Địa điểm: ").append(safe(job.location()))
            .append("; Hình thức làm việc: ").append(safe(job.workType())).append('\n');
        if (job.salaryRange() != null) {
            builder.append("Mức lương: ").append(formatSalary(job.salaryRange())).append('\n');
        }
        builder.append("Phúc lợi: ").append(String.join(", ", emptyToPlaceholder(job.benefits()))).append('\n');
        return builder.toString();
    }

    ObjectNode buildJobMetadata(JobDto job) {
        ObjectNode node = objectMapper.createObjectNode();
        node.put("jobId", job.id() != null ? job.id().toString() : null);
        node.put("title", clean(job.title()));
        node.put("companyId", job.companyId() != null ? job.companyId().toString() : null);
        node.put("companyName", clean(job.companyName()));
        node.put("location", clean(job.location()));
        node.put("workType", clean(job.workType()));
        node.put("level", clean(job.level()));
        node.put("status", clean(job.status()));
        node.put("postedAt", job.postedAt() != null ? job.postedAt().toString() : null);
        node.put("jobUrl", clean(job.url()));
        if (job.salaryRange() != null) {
            node.put("salaryMin", toString(job.salaryRange().min()));
            node.put("salaryMax", toString(job.salaryRange().max()));
            node.put("salaryCurrency", clean(job.salaryRange().currency()));
            node.put("salaryPeriod", clean(job.salaryRange().period()));
        }
        ArrayNode benefitsNode = node.putArray("benefits");
        appendValues(benefitsNode, job.benefits());
        ArrayNode skillsNode = node.putArray("skills");
        appendValues(skillsNode, job.skills());
        return node;
    }

    String buildProfileSummary(ProfileDto profile) {
        StringBuilder builder = new StringBuilder();
        builder.append("Tóm tắt: ").append(safe(profile.summary())).append('\n');
        builder.append("Kỹ năng nổi bật: ").append(String.join(", ", emptyToPlaceholder(profile.skills()))).append('\n');
        builder.append("Ưu tiên địa điểm: ").append(String.join(", ", emptyToPlaceholder(profile.preferredLocations()))).append('\n');
        builder.append("Hình thức làm việc: ").append(profile.remoteOk() ? "Mở remote/hybrid" : "Ưu tiên on-site").append('\n');
        if (profile.salaryExpectation() != null) {
            builder.append("Kỳ vọng lương: ").append(formatMoney(profile.salaryExpectation())).append('\n');
        }
        builder.append("Ngành quan tâm: ").append(String.join(", ", emptyToPlaceholder(profile.industries()))).append('\n');
        builder.append("Ngôn ngữ: ").append(String.join(", ", emptyToPlaceholder(profile.languages())));
        return builder.toString();
    }

    ObjectNode buildPreferences(ProfileDto profile) {
        ObjectNode node = objectMapper.createObjectNode();
        node.put("remoteOk", profile.remoteOk());
        if (profile.salaryExpectation() != null) {
            node.put("salaryExpectation", profile.salaryExpectation());
        }
        ArrayNode locations = node.putArray("preferredLocations");
        appendValues(locations, profile.preferredLocations());
        ArrayNode skills = node.putArray("skills");
        appendValues(skills, profile.skills());
        ArrayNode industries = node.putArray("industries");
        appendValues(industries, profile.industries());
        ArrayNode languages = node.putArray("languages");
        appendValues(languages, profile.languages());
        return node;
    }

    private String formatSalary(JobDto.SalaryRange salaryRange) {
        String min = toString(salaryRange.min());
        String max = toString(salaryRange.max());
        return String.format("%s - %s %s/%s", min, max, safe(salaryRange.currency()), safe(salaryRange.period()));
    }

    private List<String> emptyToPlaceholder(List<String> values) {
        if (CollectionUtils.isEmpty(values)) {
            return List.of("Chưa cập nhật");
        }
        return values.stream()
            .filter(StringUtils::hasText)
            .map(String::trim)
            .collect(Collectors.toList());
    }

    private String safe(String value) {
        return StringUtils.hasText(value) ? value.trim() : "Chưa cập nhật";
    }

    private String clean(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private void appendValues(ArrayNode node, List<String> values) {
        if (CollectionUtils.isEmpty(values)) {
            return;
        }
        values.stream()
            .filter(StringUtils::hasText)
            .map(String::trim)
            .forEach(node::add);
    }

    private String toString(BigDecimal value) {
        return value != null ? value.stripTrailingZeros().toPlainString() : null;
    }

    private String formatMoney(BigDecimal value) {
        if (value == null) {
            return "Chưa cập nhật";
        }
        return value.stripTrailingZeros().toPlainString() + " VND/tháng";
    }
}
