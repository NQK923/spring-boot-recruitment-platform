package com.recruitment.platform.chat.recommendation.client;

import com.recruitment.platform.chat.config.ServiceClientProperties;
import com.recruitment.platform.chat.dto.job.JobDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.UUID;

@Component
public class JobServiceClient {

    private static final Logger LOG = LoggerFactory.getLogger(JobServiceClient.class);

    private final WebClient webClient;

    public JobServiceClient(WebClient.Builder builder, ServiceClientProperties properties) {
        this.webClient = builder
            .baseUrl(properties.getGatewayBaseUrl())
            .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
            .build();
    }

    public JobDto getPublicJob(UUID jobId, String bearerToken) {
        return webClient.get()
            .uri(uriBuilder -> uriBuilder.path("/api/jobs/public/{id}").build(jobId))
            .headers(headers -> applyAuth(headers, bearerToken))
            .retrieve()
            .bodyToMono(JobDto.class)
            .timeout(Duration.ofSeconds(5))
            .doOnError(error -> LOG.error("Không thể gọi job-service cho job {}", jobId, error))
            .onErrorResume(error -> Mono.empty())
            .blockOptional()
            .orElse(null);
    }

    private void applyAuth(HttpHeaders headers, String bearerToken) {
        if (bearerToken != null && !bearerToken.isBlank()) {
            headers.set(HttpHeaders.AUTHORIZATION, bearerToken);
        }
    }
}
