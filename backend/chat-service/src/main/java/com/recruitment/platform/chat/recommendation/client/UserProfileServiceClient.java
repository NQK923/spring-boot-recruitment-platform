package com.recruitment.platform.chat.recommendation.client;

import com.recruitment.platform.chat.config.ServiceClientProperties;
import com.recruitment.platform.chat.dto.profile.ProfileDto;
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
public class UserProfileServiceClient {

    private static final Logger LOG = LoggerFactory.getLogger(UserProfileServiceClient.class);

    private final WebClient webClient;

    public UserProfileServiceClient(WebClient.Builder builder, ServiceClientProperties properties) {
        this.webClient = builder
            .baseUrl(properties.getGatewayBaseUrl())
            .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
            .build();
    }

    public ProfileDto getProfile(UUID userId, String bearerToken) {
        if (userId == null) {
            return null;
        }
        return webClient.get()
            .uri(uriBuilder -> uriBuilder.path("/api/profiles/{userId}").build(userId))
            .headers(headers -> applyAuth(headers, bearerToken))
            .retrieve()
            .bodyToMono(ProfileDto.class)
            .timeout(Duration.ofSeconds(5))
            .doOnError(error -> LOG.warn("Không thể lấy hồ sơ ứng viên {}", userId, error))
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
