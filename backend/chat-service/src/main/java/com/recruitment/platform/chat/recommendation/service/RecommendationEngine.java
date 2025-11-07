package com.recruitment.platform.chat.recommendation.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.recruitment.platform.chat.config.RecommendationProperties;
import com.recruitment.platform.chat.recommendation.model.JobSuggestion;
import com.recruitment.platform.chat.recommendation.repository.RecJobRepository;
import com.recruitment.platform.chat.recommendation.repository.RecProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class RecommendationEngine {

    private final RecJobRepository jobRepository;
    private final RecProfileRepository profileRepository;
    private final EmbeddingService embeddingService;
    private final RecommendationProperties properties;

    public RecommendationEngine(RecJobRepository jobRepository,
                                RecProfileRepository profileRepository,
                                EmbeddingService embeddingService,
                                RecommendationProperties properties) {
        this.jobRepository = jobRepository;
        this.profileRepository = profileRepository;
        this.embeddingService = embeddingService;
        this.properties = properties;
    }

    public List<JobSuggestion> recommend(Long userId, String userQuery, int desiredFinalK) {
        float[] queryVector = embeddingService.embedText(userQuery);
        float[] profileVector = profileRepository.findEmbedding(userId).orElse(null);
        List<RecJobRepository.JobHit> hits = jobRepository.search(
            properties.getTopK(),
            queryVector,
            profileVector,
            properties.getFreshnessDays()
        );
        if (hits.isEmpty()) {
            return List.of();
        }
        int finalSize = desiredFinalK > 0 ? desiredFinalK : properties.getFinalK();
        return hits.stream()
            .limit(finalSize)
            .map(hit -> toSuggestion(hit, userQuery))
            .collect(Collectors.toList());
    }

    private JobSuggestion toSuggestion(RecJobRepository.JobHit hit, String query) {
        JsonNode metadata = hit.metadata();
        String title = text(metadata, "title", "Vị trí chưa đặt tên");
        String company = text(metadata, "companyName", "Doanh nghiệp ẩn danh");
        String location = text(metadata, "location", "Nhiều địa điểm");
        String workType = text(metadata, "workType", "Chưa cập nhật");
        String url = text(metadata, "jobUrl", "");
        String reason = buildReason(metadata, query);
        return new JobSuggestion(hit.jobId(), title, company, location, workType, url, reason, hit.score());
    }

    private String buildReason(JsonNode metadata, String query) {
        List<String> reasons = new ArrayList<>();
        String location = text(metadata, "location", null);
        if (hasKeyword(query, location)) {
            reasons.add("Địa điểm đúng nhu cầu của bạn (" + location + ").");
        }
        String workType = text(metadata, "workType", null);
        if (matchesWorkPreference(query, workType)) {
            reasons.add("Hình thức làm việc " + workType + " phù hợp mong muốn.");
        }
        List<String> matchedSkills = matchSkills(metadata.path("skills"), query);
        if (!matchedSkills.isEmpty()) {
            reasons.add("Kỹ năng trùng khớp: " + String.join(", ", matchedSkills) + ".");
        }
        String salaryNote = buildSalaryReason(metadata);
        if (salaryNote != null) {
            reasons.add(salaryNote);
        }
        if (reasons.isEmpty()) {
            reasons.add("Điểm tương đồng cao với câu hỏi của bạn và đang mở tuyển.");
        }
        return String.join(" ", reasons);
    }

    private boolean hasKeyword(String query, String candidate) {
        if (!StringUtils.hasText(query) || !StringUtils.hasText(candidate)) {
            return false;
        }
        return query.toLowerCase(Locale.ROOT).contains(candidate.toLowerCase(Locale.ROOT));
    }

    private boolean matchesWorkPreference(String query, String workType) {
        if (!StringUtils.hasText(query) || !StringUtils.hasText(workType)) {
            return false;
        }
        String lowerQuery = query.toLowerCase(Locale.ROOT);
        String lowerWork = workType.toLowerCase(Locale.ROOT);
        if (lowerQuery.contains("remote") && lowerWork.contains("remote")) {
            return true;
        }
        if ((lowerQuery.contains("onsite") || lowerQuery.contains("on-site") || lowerQuery.contains("tại văn phòng"))
            && lowerWork.contains("on")) {
            return true;
        }
        return lowerQuery.contains("hybrid") && lowerWork.contains("hybrid");
    }

    private List<String> matchSkills(JsonNode skillsNode, String query) {
        if (skillsNode == null || !skillsNode.isArray() || !StringUtils.hasText(query)) {
            return List.of();
        }
        Set<String> skillTokens = new HashSet<>();
        skillsNode.forEach(node -> {
            if (node.isTextual()) {
                skillTokens.add(node.asText().toLowerCase(Locale.ROOT));
            }
        });
        if (skillTokens.isEmpty()) {
            return List.of();
        }
        Set<String> queryTokens = extractKeywords(query);
        return skillTokens.stream()
            .filter(queryTokens::contains)
            .limit(3)
            .map(this::capitalize)
            .collect(Collectors.toList());
    }

    private Set<String> extractKeywords(String text) {
        if (!StringUtils.hasText(text)) {
            return Set.of();
        }
        String normalized = text.toLowerCase(Locale.ROOT)
            .replaceAll("[^a-z0-9áàảãạăắằẳẵặâấầẩẫậđéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵ ]", " ");
        String[] parts = normalized.split("\\s+");
        Set<String> result = new HashSet<>();
        for (String part : parts) {
            if (part.length() >= 3) {
                result.add(part);
            }
        }
        return result;
    }

    private String buildSalaryReason(JsonNode metadata) {
        String min = text(metadata, "salaryMin", null);
        String max = text(metadata, "salaryMax", null);
        String currency = text(metadata, "salaryCurrency", "");
        if (min == null && max == null) {
            String salaryText = text(metadata, "salaryText", null);
            if (salaryText != null) {
                return "Mức lương tham khảo: " + salaryText + ".";
            }
            return null;
        }
        if (max != null) {
            return "Mức lương tham khảo tới " + formatCurrency(max, currency) + ".";
        }
        return "Có thông tin lương từ " + formatCurrency(min, currency) + ".";
    }

    private String formatCurrency(String value, String currency) {
        if (!StringUtils.hasText(value)) {
            return "mức cạnh tranh";
        }
        try {
            BigDecimal amount = new BigDecimal(value);
            NumberFormat formatter = NumberFormat.getInstance(new Locale("vi", "VN"));
            return formatter.format(amount) + " " + currency;
        } catch (NumberFormatException ex) {
            return value + " " + currency;
        }
    }

    private String text(JsonNode node, String field, String fallback) {
        if (node == null) {
            return fallback;
        }
        JsonNode value = node.get(field);
        if (value == null || value.isNull()) {
            return fallback;
        }
        String text = value.asText();
        return StringUtils.hasText(text) ? text : fallback;
    }

    private String capitalize(String value) {
        if (!StringUtils.hasText(value)) {
            return value;
        }
        return Character.toUpperCase(value.charAt(0)) + value.substring(1);
    }
}
