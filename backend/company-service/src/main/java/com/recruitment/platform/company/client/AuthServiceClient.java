package com.recruitment.platform.company.client;

import com.recruitment.platform.company.client.dto.InternalInviteRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "AUTH-SERVICE") // The 'name' must match the spring.application.name of auth-service
public interface AuthServiceClient {

    @PostMapping("/api/internal/auth/invites")
    void createInvitation(@RequestBody InternalInviteRequest request);

}
