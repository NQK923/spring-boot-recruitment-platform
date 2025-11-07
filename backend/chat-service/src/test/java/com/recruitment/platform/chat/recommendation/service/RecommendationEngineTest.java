package com.recruitment.platform.chat.recommendation.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.recruitment.platform.chat.config.RecommendationProperties;
import com.recruitment.platform.chat.recommendation.model.JobSuggestion;
import com.recruitment.platform.chat.recommendation.repository.RecJobRepository;
import com.recruitment.platform.chat.recommendation.repository.RecProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class RecommendationEngineTest {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private RecJobRepository jobRepository;
    private RecProfileRepository profileRepository;
    private EmbeddingService embeddingService;
    private RecommendationProperties properties;
    private RecommendationEngine engine;

    @BeforeEach
    void setup() {
        jobRepository = mock(RecJobRepository.class);
        profileRepository = mock(RecProfileRepository.class);
        embeddingService = mock(EmbeddingService.class);
        properties = new RecommendationProperties();
        engine = new RecommendationEngine(jobRepository, profileRepository, embeddingService, properties);

        when(embeddingService.embedText(ArgumentMatchers.anyString())).thenReturn(new float[] {0.1f, 0.2f});
        when(profileRepository.findEmbedding(ArgumentMatchers.any())).thenReturn(Optional.empty());
    }

    @Test
    void shouldPrioritizeFreshJobsWhenScoring() throws Exception {
        UUID freshJob = UUID.randomUUID();
        UUID staleJob = UUID.randomUUID();
        double recentScore = compositeScore(0.2, 0.0, 2, properties.getFreshnessDays());
        double staleScore = compositeScore(0.2, 0.0, 40, properties.getFreshnessDays());

        when(jobRepository.search(ArgumentMatchers.anyInt(), ArgumentMatchers.any(), ArgumentMatchers.isNull(), ArgumentMatchers.anyInt()))
            .thenReturn(List.of(
                new RecJobRepository.JobHit(freshJob, recentScore, metadata("Backend Java", "ABC Corp", "TP.HCM", "Hybrid", Instant.now(), "https://jobs/1")),
                new RecJobRepository.JobHit(staleJob, staleScore, metadata("Backend Java", "ABC Corp", "Remote", "Remote", Instant.now().minus(40, ChronoUnit.DAYS), "https://jobs/2"))
            ));

        List<JobSuggestion> suggestions = engine.recommend(UUID.randomUUID(), "Backend Java ở TP.HCM remote", 2);

        assertEquals(2, suggestions.size());
        assertEquals(freshJob, suggestions.get(0).jobId(), "Job mới đăng phải đứng trước do điểm cao hơn");
        assertTrue(suggestions.get(0).score() > suggestions.get(1).score(), "Điểm job gần đây phải cao hơn job cũ (do exp(-days/freshnessDays))");
    }

    private double compositeScore(double queryDistance, double profileDistance, int daysSincePosted, int freshnessDays) {
        double querySim = 1 - queryDistance;
        double profileSim = 1 - profileDistance;
        double freshnessBoost = Math.exp(-Math.max(daysSincePosted, 0d) / Math.max(freshnessDays, 1));
        return 0.50 * querySim + 0.35 * profileSim + 0.15 * freshnessBoost;
    }

    private ObjectNode metadata(String title, String company, String location, String workType, Instant postedAt, String url) {
        ObjectNode node = MAPPER.createObjectNode();
        node.put("title", title);
        node.put("companyName", company);
        node.put("location", location);
        node.put("workType", workType);
        node.put("postedAt", postedAt.toString());
        node.put("jobUrl", url);
        node.put("status", "OPEN");
        return node;
    }
}
