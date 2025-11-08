package com.recruitment.platform.chat.controller;

import com.recruitment.platform.chat.recommendation.service.RecommendationIndexer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@RestController
@RequestMapping("/api/internal/chat/reindex")
public class RecommendationInternalController {

    private static final Logger LOG = LoggerFactory.getLogger(RecommendationInternalController.class);

    private final RecommendationIndexer indexer;

    public RecommendationInternalController(RecommendationIndexer indexer) {
        this.indexer = indexer;
    }

    @PostMapping("/job/{jobId}")
    public Mono<ResponseEntity<String>> reindexJob(@PathVariable Long jobId,
                                                   @RequestHeader(name = HttpHeaders.AUTHORIZATION, required = false) String bearerToken) {
        if (jobId == null) {
            return Mono.just(ResponseEntity.badRequest().body("jobId bắt buộc."));
        }
        return Mono.fromRunnable(() -> {
                try {
                    indexer.upsertJob(jobId, bearerToken);
                } catch (Exception ex) {
                    LOG.error("Không thể reindex job {} từ internal request", jobId, ex);
                    throw ex;
                }
            })
            .subscribeOn(Schedulers.boundedElastic())
            .thenReturn(ResponseEntity.accepted().body("Đã gửi yêu cầu reindex job " + jobId));
    }
}
