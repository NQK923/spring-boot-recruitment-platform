package com.recruitment.platform.filestorage.controller;

import com.recruitment.platform.filestorage.model.FileMetadata;
import com.recruitment.platform.filestorage.service.StorageService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final StorageService storageService;

    public FileController(StorageService storageService) {
        this.storageService = storageService;
    }

    @PostMapping("/upload")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UUID> uploadFile(@RequestParam("file") MultipartFile file, @AuthenticationPrincipal Jwt jwt) {
        Long uploaderId = Long.valueOf(jwt.getSubject());
        FileMetadata metadata = storageService.storeFile(file, uploaderId);
        return ResponseEntity.ok(metadata.getId());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> downloadFile(@PathVariable UUID id) {
        // TODO: Add authorization logic to check if the user has permission to access this file.
        Resource resource = storageService.loadFileAsResource(id);
        FileMetadata metadata = storageService.findById(id); // We need a way to get metadata to set content type

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(metadata.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + metadata.getOriginalName() + "\"")
                .body(resource);
    }
}
