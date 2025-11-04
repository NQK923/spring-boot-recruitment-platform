package com.recruitment.platform.chat.ratelimit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class UserRateLimiter {

    private final int requestsPerWindow;
    private final long windowMillis;

    private final Map<String, RequestWindow> windows = new ConcurrentHashMap<>();

    public UserRateLimiter(
        @Value("${app.chat.rate-limit.requests-per-minute:10}") int requestsPerMinute
    ) {
        this.requestsPerWindow = requestsPerMinute;
        this.windowMillis = Duration.ofMinutes(1).toMillis();
    }

    public boolean tryConsume(String userKey) {
        if (userKey == null || userKey.isBlank()) {
            return false;
        }

        RequestWindow window = windows.computeIfAbsent(userKey, key -> new RequestWindow(System.currentTimeMillis()));
        synchronized (window) {
            long now = System.currentTimeMillis();
            if (now - window.windowStart > windowMillis) {
                window.windowStart = now;
                window.requestCount = 0;
            }
            if (window.requestCount >= requestsPerWindow) {
                return false;
            }
            window.requestCount++;
            return true;
        }
    }

    private static final class RequestWindow {
        private long windowStart;
        private int requestCount;

        private RequestWindow(long windowStart) {
            this.windowStart = windowStart;
            this.requestCount = 0;
        }
    }
}
