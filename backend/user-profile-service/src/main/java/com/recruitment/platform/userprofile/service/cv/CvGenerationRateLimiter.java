package com.recruitment.platform.userprofile.service.cv;

import com.recruitment.platform.userprofile.exception.RateLimitExceededException;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class CvGenerationRateLimiter {

    private static final int MAX_REQUESTS_PER_MINUTE = 3;
    private static final Duration WINDOW = Duration.ofMinutes(1);

    private final Map<Long, Deque<Instant>> buckets = new ConcurrentHashMap<>();

    public void verifyCanGenerate(Long userId) {
        Instant now = Instant.now();
        Deque<Instant> deque = buckets.computeIfAbsent(userId, id -> new ArrayDeque<>());

        synchronized (deque) {
            while (!deque.isEmpty() && Duration.between(deque.peekFirst(), now).compareTo(WINDOW) > 0) {
                deque.pollFirst();
            }
            if (deque.size() >= MAX_REQUESTS_PER_MINUTE) {
                throw new RateLimitExceededException("Bạn đã yêu cầu tạo CV quá nhiều lần. Vui lòng thử lại sau ít phút.");
            }
            deque.addLast(now);
        }
    }
}
