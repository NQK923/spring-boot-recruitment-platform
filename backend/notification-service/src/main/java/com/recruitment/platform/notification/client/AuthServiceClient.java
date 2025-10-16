package com.recruitment.platform.notification.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@FeignClient(name = "gateway-auth-client-for-notification", url = "http://gateway-service:8080")
public interface AuthServiceClient {

    record UserEmailInfo(Long id, String email) {}
    record BatchUserIdsRequest(List<Long> userIds) {}

    @PostMapping("/api/internal/auth/users/batch")
    List<UserEmailInfo> getUsersByIds(@RequestBody BatchUserIdsRequest request);

}
