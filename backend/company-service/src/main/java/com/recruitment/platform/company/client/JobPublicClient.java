package com.recruitment.platform.company.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@FeignClient(name = "gateway-job-public-client", url = "http://gateway-service:8080")
public interface JobPublicClient {

    record JobPostingPublic(
            Long id,
            Long companyId,
            String title,
            String description,
            String requirements,
            String benefits,
            String salaryRange,
            String location,
            String workType,
            String department,
            String level,
            String status
    ) {}

    @GetMapping("/api/jobs/public")
    List<JobPostingPublic> listPublicJobs();
}
