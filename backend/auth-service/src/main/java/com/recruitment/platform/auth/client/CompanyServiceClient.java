package com.recruitment.platform.auth.client;

import com.recruitment.platform.auth.client.dto.AddUserToCompanyRequest;
import com.recruitment.platform.auth.client.dto.CompanyMembershipResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "gateway-company-client", url = "${app.clients.gateway-base-url:http://gateway-service:8080}")
public interface CompanyServiceClient {

    @PostMapping("/api/internal/companies/users")
    void addUserToCompany(@RequestBody AddUserToCompanyRequest request);

    @GetMapping("/api/internal/companies/users/{userId}/company")
    CompanyMembershipResponse getCompanyMembership(@PathVariable("userId") Long userId);

}
