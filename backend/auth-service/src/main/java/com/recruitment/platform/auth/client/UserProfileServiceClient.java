package com.recruitment.platform.auth.client;

import com.recruitment.platform.auth.client.dto.AvatarSyncRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "gateway-user-profile-client", url = "${app.clients.gateway-base-url:http://gateway-service:8080}")
public interface UserProfileServiceClient {

    @PostMapping("/api/internal/profiles/{userId}/avatar")
    void syncAvatar(@PathVariable("userId") Long userId, @RequestBody AvatarSyncRequest request);
}
