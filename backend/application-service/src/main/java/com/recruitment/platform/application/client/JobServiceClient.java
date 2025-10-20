package com.recruitment.platform.application.client;

import com.recruitment.platform.application.client.dto.JobSummaryDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "gateway-job-client", url = "http://gateway-service:8080")
public interface JobServiceClient {

    @GetMapping("/api/internal/jobs/{jobId}")
    JobSummaryDto getJobById(@PathVariable("jobId") Long jobId);
}
