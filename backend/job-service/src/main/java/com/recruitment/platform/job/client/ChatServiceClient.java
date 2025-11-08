package com.recruitment.platform.job.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

@FeignClient(
        name = "chat-service-client",
        url = "${app.gateway.base-url:http://gateway-service:8080}",
        path = "/api/internal/chat"
)
public interface ChatServiceClient {

    @PostMapping("/reindex/job/{jobId}")
    void reindexJob(@PathVariable("jobId") Long jobId);
}
