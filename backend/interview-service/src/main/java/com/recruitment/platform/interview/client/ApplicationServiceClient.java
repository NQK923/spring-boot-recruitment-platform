package com.recruitment.platform.interview.client;

import com.recruitment.platform.interview.client.dto.ApplicationSummaryDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "interview-application-client", url = "http://gateway-service:8080")
public interface ApplicationServiceClient {

    @GetMapping("/api/internal/applications/{applicationId}/summary")
    ApplicationSummaryDto getApplicationSummary(@PathVariable("applicationId") Long applicationId);
}
