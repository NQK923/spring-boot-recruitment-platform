package com.recruitment.platform.company.client;

import com.recruitment.platform.company.client.dto.InternalInviteRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "gateway-auth-client", url = "http://gateway-service:8080")
public interface AuthServiceClient {

    @PostMapping("/api/internal/auth/invites")
    void createInvitation(@RequestBody InternalInviteRequest request);

}
