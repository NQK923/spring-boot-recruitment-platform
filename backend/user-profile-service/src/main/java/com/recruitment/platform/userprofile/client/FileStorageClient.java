package com.recruitment.platform.userprofile.client;

import com.recruitment.platform.userprofile.client.dto.AvatarUploadResponse;
import com.recruitment.platform.userprofile.client.dto.FileAvatarSyncRequest;
import com.recruitment.platform.userprofile.client.dto.FileUploadResponse;
import com.recruitment.platform.userprofile.config.FeignSupportConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

@FeignClient(name = "gateway-file-storage-client", url = "http://gateway-service:8080", configuration = FeignSupportConfig.class)
public interface FileStorageClient {

    @PostMapping(value = "/api/files/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    FileUploadResponse uploadFile(@RequestPart("file") MultipartFile file);

    @PostMapping(value = "/api/files/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    AvatarUploadResponse uploadAvatar(@RequestPart("file") MultipartFile file);

    @PostMapping(value = "/api/internal/files/avatars/sync")
    AvatarUploadResponse syncAvatar(@RequestBody FileAvatarSyncRequest request);
}
