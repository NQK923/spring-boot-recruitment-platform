package com.recruitment.platform.chat.recommendation.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.recruitment.platform.chat.config.RecommendationProperties;
import com.recruitment.platform.chat.dto.job.JobDto;
import com.recruitment.platform.chat.recommendation.client.JobServiceClient;
import com.recruitment.platform.chat.recommendation.repository.RecJobRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RecommendationIndexer {

    private static final Logger LOG = LoggerFactory.getLogger(RecommendationIndexer.class);

    private final JobServiceClient jobServiceClient;
    private final RecJobRepository jobRepository;
    private final EmbeddingService embeddingService;
    private final ObjectMapper objectMapper;
    private final RecommendationProperties properties;

    public RecommendationIndexer(JobServiceClient jobServiceClient,
                                 RecJobRepository jobRepository,
                                 EmbeddingService embeddingService,
                                 ObjectMapper objectMapper,
                                 RecommendationProperties properties) {
        this.jobServiceClient = jobServiceClient;
        this.jobRepository = jobRepository;
        this.embeddingService = embeddingService;
        this.objectMapper = objectMapper;
        this.properties = properties;
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
        node.put("jobUrl", clean(resolveJobUrl(job)));
        node.put("salaryText", clean(job.salaryRange()));

        ArrayNode benefitsNode = node.putArray("benefits");
        splitToList(job.benefits()).forEach(benefitsNode::add);

        return node;
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

    private String resolveJobUrl(JobDto job) {
        if (job == null) {
            return null;
        }
        if (StringUtils.hasText(job.url())) {
            return job.url().trim();
        }
        if (job.id() == null) {
            return null;
        }
        String base = properties.getJobDetailBaseUrl();
        if (!StringUtils.hasText(base)) {
            return null;
        }
        String trimmedBase = base.trim();
        String separator = trimmedBase.endsWith("/") ? "" : "/";
        return trimmedBase + separator + job.id();
    }

}
