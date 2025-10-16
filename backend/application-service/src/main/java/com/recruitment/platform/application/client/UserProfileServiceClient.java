package com.recruitment.platform.application.client;

import com.recruitment.platform.application.client.dto.UserProfileDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

// Point to the gateway instead of the direct service
// The URL assumes a Docker environment where the gateway is reachable by its service name
@FeignClient(name = "gateway-profile-client", url = "http://gateway-service:8080")
public interface UserProfileServiceClient {

    record BatchUserIdsRequest(List<Long> userIds) {}

    // The path is now the full path from the gateway
    @PostMapping("/api/internal/profiles/batch")
    List<UserProfileDto> getProfilesInBatch(@RequestBody BatchUserIdsRequest request);
}
