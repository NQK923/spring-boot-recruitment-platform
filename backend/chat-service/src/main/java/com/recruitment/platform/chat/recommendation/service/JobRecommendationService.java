package com.recruitment.platform.chat.recommendation.service;

import com.recruitment.platform.chat.config.RecommendationProperties;
import com.recruitment.platform.chat.recommendation.model.JobSuggestion;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.List;

@Service
public class JobRecommendationService {

    private final RecommendationEngine engine;
    private final RecommendationBootstrapper bootstrapper;
    private final RecommendationProperties properties;

    public JobRecommendationService(RecommendationEngine engine,
                                    RecommendationBootstrapper bootstrapper,
                                    RecommendationProperties properties) {
        this.engine = engine;
        this.bootstrapper = bootstrapper;
        this.properties = properties;
    }

    public Mono<List<JobSuggestion>> recommend(String query, String bearerToken) {
        String sanitizedQuery = StringUtils.hasText(query) ? query : "gợi ý việc làm mới nhất";
        return Mono.fromCallable(() -> {
                bootstrapper.ensureJobsSeeded(bearerToken);
                return engine.recommend(sanitizedQuery, properties.getFinalK());
            })
            .subscribeOn(Schedulers.boundedElastic());
    }

    public Flux<JobSuggestion> recommendStream(String query, String bearerToken) {
        return recommend(query, bearerToken)
            .flatMapMany(Flux::fromIterable);
    }
}


