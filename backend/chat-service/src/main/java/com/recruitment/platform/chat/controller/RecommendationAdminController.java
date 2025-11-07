package com.recruitment.platform.chat.controller;

import com.recruitment.platform.chat.recommendation.service.RecommendationIndexer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat/reindex")
public class RecommendationAdminController {

    private static final Set<String> ADMIN_AUTHORITIES = Set.of("SCOPE_SUPER_ADMIN", "SCOPE_COMPANY_ADMIN", "ROLE_ADMIN");

    private final RecommendationIndexer indexer;

    public RecommendationAdminController(RecommendationIndexer indexer) {
        this.indexer = indexer;
    }

    @PostMapping("/job/{jobId}")
    public Mono<ResponseEntity<String>> reindexJob(@PathVariable UUID jobId,
                                                   Authentication authentication,
                                                   ServerHttpRequest request) {
        ensureAdmin(authentication);
        String token = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        return Mono.fromRunnable(() -> indexer.upsertJob(jobId, token))
            .subscribeOn(Schedulers.boundedElastic())
            .thenReturn(ResponseEntity.accepted().body("Đã cập nhật embedding cho job " + jobId));
    }

    @PostMapping("/profile/{userId}")
    public Mono<ResponseEntity<String>> reindexProfile(@PathVariable UUID userId,
                                                       Authentication authentication,
                                                       ServerHttpRequest request) {
        ensureAdmin(authentication);
        String token = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        return Mono.fromRunnable(() -> indexer.upsertProfile(userId, token))
            .subscribeOn(Schedulers.boundedElastic())
            .thenReturn(ResponseEntity.accepted().body("Đã cập nhật embedding hồ sơ cho user " + userId));
    }

    private void ensureAdmin(Authentication authentication) {
        if (authentication == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ admin mới được reindex dữ liệu.");
        }
        boolean allowed = authentication.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .anyMatch(ADMIN_AUTHORITIES::contains);
        if (!allowed) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền reindex dữ liệu.");
        }
    }
}
