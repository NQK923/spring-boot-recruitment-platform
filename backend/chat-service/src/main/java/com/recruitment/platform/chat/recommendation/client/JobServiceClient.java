package com.recruitment.platform.chat.recommendation.client;

import com.recruitment.platform.chat.config.ServiceClientProperties;
import com.recruitment.platform.chat.dto.job.JobDto;
import com.recruitment.platform.chat.dto.job.JobPageResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.Collections;
import java.util.List;

@Component
public class JobServiceClient {

    private static final Logger LOG = LoggerFactory.getLogger(JobServiceClient.class);
    private static final ParameterizedTypeReference<JobPageResponse> PAGE_TYPE =
        new ParameterizedTypeReference<>() {};

    private final WebClient webClient;

    public JobServiceClient(WebClient.Builder builder, ServiceClientProperties properties) {
        this.webClient = builder
            .baseUrl(properties.getGatewayBaseUrl())
            .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
            .build();
    }

    public JobDto getPublicJob(Long jobId, String bearerToken) {
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

    public List<JobDto> listPublicJobs(int page, int size, String search, String bearerToken) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.max(size, 1);
        return webClient.get()
            .uri(uriBuilder -> {
                var builder = uriBuilder.path("/api/jobs/public")
                    .queryParam("page", safePage)
                    .queryParam("size", safeSize);
                if (StringUtils.hasText(search)) {
                    builder.queryParam("search", search.trim());
                }
                return builder.build();
            })
            .headers(headers -> applyAuth(headers, bearerToken))
            .retrieve()
            .bodyToMono(PAGE_TYPE)
            .timeout(Duration.ofSeconds(5))
            .map(response -> {
                if (response == null || response.items() == null) {
                    return Collections.<JobDto>emptyList();
                }
                return response.items();
            })
            .doOnError(error -> LOG.error("Không thể lấy danh sách job công khai", error))
            .onErrorResume(error -> Mono.just(Collections.emptyList()))
            .blockOptional()
            .orElse(Collections.emptyList());
    }

    private void applyAuth(HttpHeaders headers, String bearerToken) {
        if (bearerToken != null && !bearerToken.isBlank()) {
            headers.set(HttpHeaders.AUTHORIZATION, bearerToken);
        }
    }
}
