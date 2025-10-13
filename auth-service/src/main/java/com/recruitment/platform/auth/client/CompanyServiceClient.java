package com.recruitment.platform.auth.client;

import com.recruitment.platform.auth.client.dto.AddUserToCompanyRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "COMPANY-SERVICE")
public interface CompanyServiceClient {

    @PostMapping("/api/internal/companies/users")
    void addUserToCompany(@RequestBody AddUserToCompanyRequest request);

}
