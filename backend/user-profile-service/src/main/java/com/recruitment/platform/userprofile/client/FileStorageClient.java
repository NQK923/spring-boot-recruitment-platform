package com.recruitment.platform.userprofile.client;

import com.recruitment.platform.userprofile.config.FeignSupportConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@FeignClient(name = "FILE-STORAGE-SERVICE", configuration = FeignSupportConfig.class)
public interface FileStorageClient {

    @PostMapping(value = "/api/files/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    UUID uploadFile(@RequestPart("file") MultipartFile file);

}
