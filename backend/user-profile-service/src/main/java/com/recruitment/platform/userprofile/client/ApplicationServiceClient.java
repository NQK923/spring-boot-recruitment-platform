package com.recruitment.platform.userprofile.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "gateway-application-client", url = "http://gateway-service:8080")
public interface ApplicationServiceClient {

    @GetMapping("/api/internal/applications/candidates/{candidateId}/companies/{companyId}/exists")
    Boolean candidateHasApplicationsForCompany(@PathVariable("candidateId") Long candidateId,
                                               @PathVariable("companyId") Long companyId);
}
