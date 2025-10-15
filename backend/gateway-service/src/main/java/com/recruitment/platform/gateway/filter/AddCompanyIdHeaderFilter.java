package com.recruitment.platform.gateway.filter;

import com.recruitment.platform.gateway.client.CompanyServiceClient;
import com.recruitment.platform.gateway.dto.CompanyUser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.util.List;

@Component
public class AddCompanyIdHeaderFilter implements GlobalFilter, Ordered {

    private final CompanyServiceClient companyServiceClient;
    private final SecretKey jwtSecretKey;

    public AddCompanyIdHeaderFilter(CompanyServiceClient companyServiceClient, @Value("${app.jwt.secret}") String secret) {
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

        try {
            Claims claims = Jwts.parserBuilder().setSigningKey(jwtSecretKey).build().parseClaimsJws(token).getBody();
            Long userId = Long.parseLong(claims.getSubject());

            // This is a blocking call within a reactive chain, which is not ideal.
            // For a production app, consider using reactive Feign or WebClient with block() or subscribeOn().
            CompanyUser companyUser = companyServiceClient.getCompanyForUser(userId);

            if (companyUser != null && companyUser.getId() != null) {
                String companyId = companyUser.getId().getCompanyId().toString();
                exchange.getRequest().mutate()
                        .header("X-Company-ID", companyId)
                        .build();
            }

        } catch (Exception e) {
            // Log error, but don't block the request if the call fails
            // Or return an unauthorized error
        }

        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        return -1; // Run before other filters
    }
}
