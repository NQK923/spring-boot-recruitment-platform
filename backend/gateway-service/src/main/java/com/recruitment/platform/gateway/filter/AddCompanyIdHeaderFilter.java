package com.recruitment.platform.gateway.filter;

import com.recruitment.platform.gateway.client.CompanyServiceClient;
import com.recruitment.platform.gateway.dto.CompanyUser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.context.annotation.Lazy;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import javax.crypto.SecretKey;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class AddCompanyIdHeaderFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(AddCompanyIdHeaderFilter.class);
    private static final String HEADER_COMPANY_ID = "X-Company-ID";
    private static final String HEADER_USER_ID = "X-User-ID";
    private static final String HEADER_USER_ROLES = "X-User-Roles";

    private final CompanyServiceClient companyServiceClient;
    private final SecretKey jwtSecretKey;

    public AddCompanyIdHeaderFilter(@Lazy CompanyServiceClient companyServiceClient, @Value("${app.jwt.secret}") String secret) {
        this.companyServiceClient = companyServiceClient;
        this.jwtSecretKey = Keys.hmacShaKeyFor(secret.getBytes());
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        List<String> authHeaders = exchange.getRequest().getHeaders().get(HttpHeaders.AUTHORIZATION);

        if (authHeaders == null || authHeaders.isEmpty() || !authHeaders.get(0).startsWith("Bearer ")) {
            return chain.filter(exchange);
        }

        String token = authHeaders.get(0).substring(7);

        Claims claims;
        try {
            claims = Jwts.parserBuilder().setSigningKey(jwtSecretKey).build().parseClaimsJws(token).getBody();
        } catch (Exception e) {
            log.warn("Failed to parse JWT in gateway filter: {}", e.getMessage());
            return chain.filter(exchange);
        }

        Long userId;
        try {
            userId = Long.parseLong(claims.getSubject());
        } catch (NumberFormatException ex) {
            log.warn("Invalid JWT subject {}, cannot derive user id", claims.getSubject());
            return chain.filter(exchange);
        }

        return Mono.fromCallable(() -> companyServiceClient.getCompanyForUser(userId))
                .subscribeOn(Schedulers.boundedElastic())
                .map(companyUser -> mutateExchange(exchange, claims, userId, companyUser))
                .onErrorResume(ex -> {
                    log.warn("Unable to resolve company for user {}: {}", userId, ex.getMessage());
                    return Mono.just(mutateExchange(exchange, claims, userId, null));
                })
                .flatMap(chain::filter);
    }

    @Override
    public int getOrder() {
        return -1; // Run before other filters
    }

    private ServerWebExchange mutateExchange(ServerWebExchange exchange,
                                             Claims claims,
                                             Long userId,
                                             CompanyUser companyUser) {
        var requestBuilder = exchange.getRequest().mutate()
                .headers(headers -> {
                    headers.set(HEADER_USER_ID, String.valueOf(userId));
                    resolveRoles(claims).ifPresent(roles -> headers.set(HEADER_USER_ROLES, roles));
                    if (companyUser != null && companyUser.getId() != null && companyUser.getId().getCompanyId() != null) {
                        headers.set(HEADER_COMPANY_ID, companyUser.getId().getCompanyId().toString());
                    }
                });

        return exchange.mutate()
                .request(requestBuilder.build())
                .build();
    }

    private Optional<String> resolveRoles(Claims claims) {
        Object rolesClaim = claims.get("roles");
        if (rolesClaim instanceof List<?> roles) {
            String joined = roles.stream()
                    .filter(Objects::nonNull)
                    .map(String::valueOf)
                    .collect(Collectors.joining(","));
            return joined.isEmpty() ? Optional.empty() : Optional.of(joined);
        }
        if (rolesClaim != null) {
            String value = String.valueOf(rolesClaim);
            return value.isEmpty() ? Optional.empty() : Optional.of(value);
        }
        return Optional.empty();
    }
}
