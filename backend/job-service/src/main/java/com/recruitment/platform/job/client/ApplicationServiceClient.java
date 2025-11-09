package com.recruitment.platform.job.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "gateway-application-internal-client", url = "http://gateway-service:8080")
public interface ApplicationServiceClient {

    @GetMapping("/api/internal/applications/jobs/{jobPostingId}/hired-count")
    Long countHiredApplications(@PathVariable("jobPostingId") Long jobPostingId);
}
