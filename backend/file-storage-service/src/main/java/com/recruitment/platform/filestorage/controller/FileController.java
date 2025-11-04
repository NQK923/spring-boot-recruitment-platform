package com.recruitment.platform.filestorage.controller;

import com.recruitment.platform.filestorage.dto.AvatarSyncRequest;
import com.recruitment.platform.filestorage.dto.AvatarUploadResponse;
import com.recruitment.platform.filestorage.dto.FileUploadResponse;
import com.recruitment.platform.filestorage.model.FileMetadata;
import com.recruitment.platform.filestorage.service.StorageService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Optional;
import java.util.UUID;

import java.util.UUID;
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
    public ResponseEntity<FileUploadResponse> uploadFile(@RequestParam("file") MultipartFile file,
                                                         @AuthenticationPrincipal Jwt jwt) {
        Long uploaderId = Long.valueOf(jwt.getSubject());
        FileMetadata metadata = storageService.storePrivateFile(file, uploaderId);
        return ResponseEntity.ok(FileUploadResponse.from(metadata));
    }

    @PostMapping("/avatar")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AvatarUploadResponse> uploadAvatar(@RequestParam("file") MultipartFile file,
                                                             @AuthenticationPrincipal Jwt jwt) {
        Long uploaderId = Long.valueOf(jwt.getSubject());
        FileMetadata metadata = storageService.storeAvatar(file, uploaderId);
        return ResponseEntity.ok(AvatarUploadResponse.from(metadata));
    }

    @PostMapping("/internal/avatars/sync")
    public ResponseEntity<AvatarUploadResponse> syncAvatar(@RequestBody AvatarSyncRequest request) {
        if (request == null || request.userId() == null || !StringUtils.hasText(request.sourceUrl())) {
            return ResponseEntity.badRequest().build();
        }
        Optional<FileMetadata> metadata = storageService.storeAvatarFromExternal(request.userId(), request.sourceUrl());
        return metadata
                .map(fileMetadata -> ResponseEntity.ok(AvatarUploadResponse.from(fileMetadata)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.ACCEPTED).build());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Resource> downloadFile(@PathVariable UUID id,
                                                 @AuthenticationPrincipal Jwt jwt) {
        FileMetadata metadata = storageService.findById(id);
        if (!canAccess(metadata, jwt)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Resource resource = storageService.loadFileAsResource(id);

        String contentType = metadata.getContentType();
        MediaType mediaType = StringUtils.hasText(contentType)
                ? MediaType.parseMediaType(contentType)
                : MediaType.APPLICATION_OCTET_STREAM;

        HttpHeaders headers = new HttpHeaders();
        if (metadata.getSize() != null) {
            headers.setContentLength(metadata.getSize());
        }
        headers.setContentType(mediaType);
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + metadata.getOriginalName() + "\"");

        return new ResponseEntity<>(resource, headers, HttpStatus.OK);
    }

    private boolean canAccess(FileMetadata metadata, Jwt jwt) {
        if (jwt == null) {
            return false;
        }
        Long requesterId = Long.valueOf(jwt.getSubject());
        if (metadata.getUploaderId().equals(requesterId)) {
            return true;
        }
        Object rolesClaim = jwt.getClaim("roles");
        if (rolesClaim instanceof Iterable<?> roles) {
            for (Object role : roles) {
                if (isPrivilegedRole(String.valueOf(role))) {
                    return true;
                }
            }
        } else if (rolesClaim instanceof String rolesString) {
            return rolesString.contains("RECRUITER")
                    || rolesString.contains("COMPANY_ADMIN")
                    || rolesString.contains("SUPER_ADMIN");
        }
        return false;
    }

    private boolean isPrivilegedRole(String role) {
        return "RECRUITER".equalsIgnoreCase(role)
                || "COMPANY_ADMIN".equalsIgnoreCase(role)
                || "SUPER_ADMIN".equalsIgnoreCase(role);
    }
}
