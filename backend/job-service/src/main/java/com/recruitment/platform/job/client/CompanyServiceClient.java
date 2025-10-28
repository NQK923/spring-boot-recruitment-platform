package com.recruitment.platform.job.client;

import com.recruitment.platform.job.client.dto.CompanyStatusResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(
        name = "gateway-service",
        url = "${app.gateway.base-url:http://gateway-service:8080}",
        path = "/api/internal/companies"
)
public interface CompanyServiceClient {

    @GetMapping("/status/active")
    List<Long> getActiveCompanyIds();

    @GetMapping("/status")
    List<CompanyStatusResponse> getCompanyStatuses(@RequestParam("ids") List<Long> companyIds);
}
