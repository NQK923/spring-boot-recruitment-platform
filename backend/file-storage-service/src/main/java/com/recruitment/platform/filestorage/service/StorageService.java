package com.recruitment.platform.filestorage.service;

import com.recruitment.platform.filestorage.model.FileMetadata;
import com.recruitment.platform.filestorage.repository.FileMetadataRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class StorageService {

    private final Path fileStorageLocation;
    private final FileMetadataRepository metadataRepository;

    public StorageService(@Value("${app.storage.upload-dir}") String uploadDir, FileMetadataRepository metadataRepository) {
        this.metadataRepository = metadataRepository;
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    @Transactional
    public FileMetadata storeFile(MultipartFile file, Long uploaderId) {
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());

        try {
            if (originalFileName.contains("..")) {
                throw new RuntimeException("Sorry! Filename contains invalid path sequence " + originalFileName);
            }

            String fileExtension = "";
            int dotIndex = originalFileName.lastIndexOf('.');
            if (dotIndex > 0) {
                fileExtension = originalFileName.substring(dotIndex);
            }

            String newFileName = UUID.randomUUID().toString() + fileExtension;
            Path targetLocation = this.fileStorageLocation.resolve(newFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            FileMetadata metadata = new FileMetadata();
            metadata.setId(UUID.randomUUID());
            metadata.setOriginalName(originalFileName);
            metadata.setContentType(file.getContentType());
            metadata.setSize(file.getSize());
            metadata.setUploaderId(uploaderId);
            metadata.setStoragePath(targetLocation.toString());

            return metadataRepository.save(metadata);
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + originalFileName + ". Please try again!", ex);
        }
    }

    public Resource loadFileAsResource(UUID fileId) {
        FileMetadata metadata = metadataRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found with id " + fileId));

        try {
            Path filePath = Paths.get(metadata.getStoragePath());
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                return resource;
            } else {
                throw new RuntimeException("File not found " + metadata.getOriginalName());
            }
        } catch (MalformedURLException ex) {
            throw new RuntimeException("File not found " + metadata.getOriginalName(), ex);
        }
    }

    public FileMetadata findById(UUID fileId) {
        return metadataRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found with id " + fileId));
    }
}
