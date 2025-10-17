package com.recruitment.platform.company.client;

import com.recruitment.platform.company.client.dto.InternalInviteRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@FeignClient(name = "gateway-auth-client", url = "http://gateway-service:8080")
public interface AuthServiceClient {

    record BatchUserIdsRequest(List<Long> userIds) {}
    record UserEmailInfo(Long id, String email) {}

    @PostMapping("/api/internal/auth/invites")
    void createInvitation(@RequestBody InternalInviteRequest request);

    @PostMapping("/api/internal/auth/users/batch")
    List<UserEmailInfo> getUsersByIds(@RequestBody BatchUserIdsRequest request);
}
