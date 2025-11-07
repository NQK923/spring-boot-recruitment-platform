package com.recruitment.platform.chat.recommendation.service;

import com.recruitment.platform.chat.config.RecommendationProperties;
import com.recruitment.platform.chat.recommendation.model.JobSuggestion;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.List;
import java.util.UUID;

@Service
public class JobRecommendationService {

    private static final Logger LOG = LoggerFactory.getLogger(JobRecommendationService.class);

    private final RecommendationIndexer indexer;
    private final RecommendationEngine engine;
    private final RecommendationProperties properties;

    public JobRecommendationService(RecommendationIndexer indexer,
                                    RecommendationEngine engine,
                                    RecommendationProperties properties) {
        this.indexer = indexer;
        this.engine = engine;
        this.properties = properties;
    }

    public Mono<List<JobSuggestion>> recommend(UUID userId, String query, String bearerToken) {
        String sanitizedQuery = StringUtils.hasText(query) ? query : "gợi ý việc làm mới nhất";
        return Mono.fromCallable(() -> {
                if (userId != null) {
                    try {
                        indexer.upsertProfile(userId, bearerToken);
                    } catch (Exception ex) {
                        LOG.warn("Không thể cập nhật embedding hồ sơ cho {}: {}", userId, ex.getMessage());
                    }
                }
                return engine.recommend(userId, sanitizedQuery, properties.getFinalK());
            })
            .subscribeOn(Schedulers.boundedElastic());
    }

    public Flux<JobSuggestion> recommendStream(UUID userId, String query, String bearerToken) {
        return recommend(userId, query, bearerToken)
            .flatMapMany(Flux::fromIterable);
    }
}
