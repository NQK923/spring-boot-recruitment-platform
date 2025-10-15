package com.recruitment.platform.gateway.client;

import com.recruitment.platform.gateway.dto.CompanyUser;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "COMPANY-SERVICE")
public interface CompanyServiceClient {

    @GetMapping("/api/internal/companies/users/{userId}/company")
    CompanyUser getCompanyForUser(@PathVariable("userId") Long userId);

}
