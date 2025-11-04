package com.recruitment.platform.filestorage.service;

import com.recruitment.platform.common.exception.BadRequestException;
import com.recruitment.platform.common.exception.NotFoundException;
import com.recruitment.platform.filestorage.model.FileMetadata;
import com.recruitment.platform.filestorage.repository.FileMetadataRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Service
public class StorageService {

    private static final long MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

    private final FileMetadataRepository metadataRepository;
    private final SupabaseStorageService supabaseStorageService;
    private final String privateBucket;
    private final String avatarBucket;

    public StorageService(FileMetadataRepository metadataRepository,
                          SupabaseStorageService supabaseStorageService,
                          @Value("${supabase.storage.cv-bucket}") String privateBucket,
                          @Value("${supabase.storage.avatar-bucket}") String avatarBucket) {
        this.metadataRepository = metadataRepository;
        this.supabaseStorageService = supabaseStorageService;
        this.privateBucket = privateBucket;
        this.avatarBucket = avatarBucket;
    }

    @Transactional
    public FileMetadata storePrivateFile(MultipartFile file, Long uploaderId) {
        validateFilePresent(file);

        String originalFileName = cleanFileName(file.getOriginalFilename());
        String extension = resolveExtension(originalFileName, file.getContentType(), "pdf");
        String objectPath = "user-" + uploaderId + "/files/" + UUID.randomUUID() + "." + extension;

        uploadToSupabase(file, privateBucket, objectPath, false);

        FileMetadata metadata = new FileMetadata();
        metadata.setId(UUID.randomUUID());
        metadata.setOriginalName(originalFileName);
        metadata.setContentType(file.getContentType());
        metadata.setSize(file.getSize());
        metadata.setUploaderId(uploaderId);
        metadata.setStorageBucket(privateBucket);
        metadata.setStoragePath(objectPath);
        metadata.setPublicFile(false);
        metadata.setPublicUrl(null);
        return metadataRepository.save(metadata);
    }

    @Transactional
    public FileMetadata storeAvatar(MultipartFile file, Long uploaderId) {
        validateFilePresent(file);
        if (file.getSize() > MAX_AVATAR_SIZE_BYTES) {
            throw new BadRequestException("Avatar file is too large. Maximum allowed size is 2MB.");
        }

        String originalFileName = cleanFileName(file.getOriginalFilename());
        String extension = resolveExtension(originalFileName, file.getContentType(), "jpg");
        String objectPath = "user-" + uploaderId + "/avatars/avatar-" + UUID.randomUUID() + "." + extension;

        SupabaseUploadResult uploadResult = uploadToSupabase(file, avatarBucket, objectPath, true);

        FileMetadata metadata = new FileMetadata();
        metadata.setId(UUID.randomUUID());
        metadata.setOriginalName(originalFileName);
        metadata.setContentType(file.getContentType());
        metadata.setSize(file.getSize());
        metadata.setUploaderId(uploaderId);
        metadata.setStorageBucket(avatarBucket);
        metadata.setStoragePath(objectPath);
        metadata.setPublicFile(true);
        metadata.setPublicUrl(uploadResult.publicUrl());
        return metadataRepository.save(metadata);
    }

    @Transactional
    public Optional<FileMetadata> storeAvatarFromExternal(Long userId, String sourceUrl) {
        if (!StringUtils.hasText(sourceUrl)) {
            return Optional.empty();
        }
        Optional<RemoteFile> remoteFileOpt = supabaseStorageService.fetchRemoteFile(sourceUrl);
        if (remoteFileOpt.isEmpty()) {
            return Optional.empty();
        }

        RemoteFile remoteFile = remoteFileOpt.get();
        if (remoteFile.content().length > MAX_AVATAR_SIZE_BYTES) {
            return Optional.empty();
        }

        String extension = resolveExtension(remoteFile.filename(), remoteFile.contentType(), "jpg");
        String objectPath = "user-" + userId + "/avatars/avatar-" + UUID.randomUUID() + "." + extension;

        supabaseStorageService.uploadBytes(remoteFile.content(), avatarBucket, objectPath, remoteFile.contentType(), true);

        FileMetadata metadata = new FileMetadata();
        metadata.setId(UUID.randomUUID());
        metadata.setOriginalName(remoteFile.filename());
        metadata.setContentType(remoteFile.contentType());
        metadata.setSize((long) remoteFile.content().length);
        metadata.setUploaderId(userId);
        metadata.setStorageBucket(avatarBucket);
        metadata.setStoragePath(objectPath);
        metadata.setPublicFile(true);
        metadata.setPublicUrl(supabaseStorageService.resolvePublicUrl(avatarBucket, objectPath));
        return Optional.of(metadataRepository.save(metadata));
    }

    public FileMetadata findById(UUID fileId) {
        return metadataRepository.findById(fileId)
                .orElseThrow(() -> new NotFoundException("File not found with id " + fileId));
    }

    public Resource loadFileAsResource(UUID fileId) {
        FileMetadata metadata = findById(fileId);
        SupabaseDownloadResult downloadResult = supabaseStorageService.download(metadata.getStorageBucket(), metadata.getStoragePath())
                .orElseThrow(() -> new IllegalStateException("Unable to load stored file from Supabase."));

        return new NamedByteArrayResource(downloadResult.content(), metadata.getOriginalName(), downloadResult.contentType());
    }

    private SupabaseUploadResult uploadToSupabase(MultipartFile file, String bucket, String objectPath, boolean publicFile) {
        try {
            return supabaseStorageService.uploadBytes(file.getBytes(), bucket, objectPath, file.getContentType(), publicFile);
        } catch (IOException ex) {
            throw new IllegalStateException("Unable to read uploaded file content.", ex);
        }
    }

    private void validateFilePresent(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File must not be empty.");
        }
    }

    private String cleanFileName(String originalFilename) {
        String cleaned = StringUtils.cleanPath(Objects.requireNonNullElse(originalFilename, ""));
        if (cleaned.contains("..")) {
            throw new BadRequestException("Filename contains invalid path sequence: " + cleaned);
        }
        return cleaned;
    }

    private String resolveExtension(String filename, String contentType, String fallback) {
        String extension = null;
        if (StringUtils.hasText(filename) && filename.contains(".")) {
            extension = filename.substring(filename.lastIndexOf('.') + 1);
        }
        if (!StringUtils.hasText(extension) && StringUtils.hasText(contentType)) {
            if (contentType.contains("png")) {
                extension = "png";
            } else if (contentType.contains("jpeg") || contentType.contains("jpg")) {
                extension = "jpg";
            } else if (contentType.contains("webp")) {
                extension = "webp";
            } else if (contentType.contains("pdf")) {
                extension = "pdf";
            }
        }
        return StringUtils.hasText(extension) ? extension : fallback;
    }

    private static final class NamedByteArrayResource extends ByteArrayResource {
        private final String filename;
        private final String contentType;

        private NamedByteArrayResource(byte[] byteArray, String filename, String contentType) {
            super(byteArray);
            this.filename = filename;
            this.contentType = contentType;
        }

        @Override
        public String getFilename() {
            return filename;
        }

        public String getContentType() {
            return contentType;
        }
    }
}
