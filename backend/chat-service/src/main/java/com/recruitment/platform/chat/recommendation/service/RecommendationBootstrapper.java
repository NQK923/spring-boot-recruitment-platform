package com.recruitment.platform.chat.recommendation.service;

import com.recruitment.platform.chat.config.RecommendationProperties;
import com.recruitment.platform.chat.dto.job.JobDto;
import com.recruitment.platform.chat.recommendation.client.JobServiceClient;
import com.recruitment.platform.chat.recommendation.repository.RecJobRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;

@Component
public class RecommendationBootstrapper {

    private static final Logger LOG = LoggerFactory.getLogger(RecommendationBootstrapper.class);

    private final RecJobRepository jobRepository;
    private final RecommendationIndexer indexer;
    private final JobServiceClient jobServiceClient;
    private final RecommendationProperties properties;
    private final AtomicBoolean seeding = new AtomicBoolean(false);
    private final AtomicBoolean seeded = new AtomicBoolean(false);

    public RecommendationBootstrapper(RecJobRepository jobRepository,
                                      RecommendationIndexer indexer,
                                      JobServiceClient jobServiceClient,
                                      RecommendationProperties properties) {
        this.jobRepository = jobRepository;
        this.indexer = indexer;
        this.jobServiceClient = jobServiceClient;
        this.properties = properties;
    }

    public void ensureJobsSeeded(String bearerToken) {
        if (seeded.get()) {
            return;
        }
        if (jobRepository.hasJobs()) {
            seeded.set(true);
            return;
        }
        if (!seeding.compareAndSet(false, true)) {
            return;
        }
        try {
            List<JobDto> jobs = jobServiceClient.listPublicJobs(
                0,
                properties.getBootstrapSize(),
                null,
                bearerToken
            );
            if (jobs.isEmpty()) {
                LOG.warn("Chưa có dữ liệu job công khai để seed cho recommendation index.");
                return;
            }
            jobs.forEach(indexer::indexJob);
            seeded.set(true);
            LOG.info("Đã seed {} job công khai vào rec_db.", jobs.size());
        } catch (Exception ex) {
            LOG.error("Không thể seed dữ liệu job công khai: {}", ex.getMessage(), ex);
        } finally {
            seeding.set(false);
        }
    }
}
