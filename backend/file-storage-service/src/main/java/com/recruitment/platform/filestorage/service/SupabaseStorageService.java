package com.recruitment.platform.filestorage.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.time.Duration;
import java.util.Map;
import java.util.Optional;

@Service
public class SupabaseStorageService {

    private static final Logger log = LoggerFactory.getLogger(SupabaseStorageService.class);

    private final RestTemplate restTemplate;
    private final String projectUrl;
    private final String storageBaseUrl;
    private final String serviceRoleKey;
    private final int signedUrlExpirySeconds;

    public SupabaseStorageService(RestTemplateBuilder restTemplateBuilder,
                                  @Value("${supabase.project-url}") String projectUrl,
                                  @Value("${supabase.service-role-key}") String serviceRoleKey,
                                  @Value("${supabase.storage.signed-url-expiry-seconds:600}") int signedUrlExpirySeconds) {
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(Duration.ofSeconds(10))
                .setReadTimeout(Duration.ofSeconds(30))
                .build();
        this.projectUrl = trimTrailingSlash(projectUrl);
        this.storageBaseUrl = this.projectUrl + "/storage/v1";
        this.serviceRoleKey = serviceRoleKey;
        this.signedUrlExpirySeconds = signedUrlExpirySeconds;
    }

    public SupabaseUploadResult uploadBytes(byte[] data,
                                            String bucket,
                                            String objectPath,
                                            String contentType,
                                            boolean publicFile) {
        if (!StringUtils.hasText(serviceRoleKey)) {
            throw new IllegalStateException("Supabase service role key is not configured.");
        }

        HttpHeaders headers = createAuthHeaders();
        if (StringUtils.hasText(contentType)) {
            headers.setContentType(MediaType.parseMediaType(contentType));
        } else {
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        }
        headers.set("x-upsert", "true");

        HttpEntity<byte[]> entity = new HttpEntity<>(data, headers);
        URI target = URI.create(storageBaseUrl + "/object/" + bucket + "/" + objectPath);

        ResponseEntity<Void> response = restTemplate.exchange(target, HttpMethod.PUT, entity, Void.class);
        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new IllegalStateException("Failed to upload object to Supabase storage. Status " + response.getStatusCode());
        }

        String publicUrl = publicFile ? resolvePublicUrl(bucket, objectPath) : null;
        return new SupabaseUploadResult(objectPath, publicUrl);
    }

    public Optional<SupabaseDownloadResult> download(String bucket, String objectPath) {
        if (!StringUtils.hasText(objectPath)) {
            return Optional.empty();
        }

        HttpHeaders headers = createAuthHeaders();
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        URI target = URI.create(storageBaseUrl + "/object/" + bucket + "/" + objectPath);

        ResponseEntity<byte[]> response = restTemplate.exchange(target, HttpMethod.GET, entity, byte[].class);
        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            log.warn("Failed to download object from Supabase. Status {}", response.getStatusCode());
            return Optional.empty();
        }

        String contentType = response.getHeaders().getContentType() != null
                ? response.getHeaders().getContentType().toString()
                : MediaType.APPLICATION_OCTET_STREAM_VALUE;

        return Optional.of(new SupabaseDownloadResult(response.getBody(), contentType));
    }

    public Optional<RemoteFile> fetchRemoteFile(String url) {
        try {
            ResponseEntity<byte[]> response = restTemplate.exchange(
                    URI.create(url),
                    HttpMethod.GET,
                    new HttpEntity<>(new HttpHeaders()),
                    byte[].class
            );

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                return Optional.empty();
            }

            String contentType = response.getHeaders().getContentType() != null
                    ? response.getHeaders().getContentType().toString()
                    : MediaType.IMAGE_JPEG_VALUE;

            String filename = deriveFilename(url, contentType);

            return Optional.of(new RemoteFile(filename, contentType, response.getBody()));
        } catch (Exception ex) {
            log.warn("Unable to fetch remote file from {}: {}", url, ex.getMessage());
            return Optional.empty();
        }
    }

    public String resolvePublicUrl(String bucket, String objectPath) {
        return projectUrl + "/storage/v1/object/public/" + bucket + "/" + objectPath;
    }

    private HttpHeaders createAuthHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("apikey", serviceRoleKey);
        headers.set("Authorization", "Bearer " + serviceRoleKey);
        return headers;
    }

    private String deriveFilename(String url, String contentType) {
        if (StringUtils.hasText(url)) {
            int lastSlash = url.lastIndexOf('/');
            if (lastSlash >= 0 && lastSlash < url.length() - 1) {
                String candidate = url.substring(lastSlash + 1);
                if (candidate.contains("?")) {
                    candidate = candidate.substring(0, candidate.indexOf('?'));
                }
                if (StringUtils.hasText(candidate)) {
                    return candidate;
                }
            }
        }

        if (contentType.contains("png")) {
            return "avatar.png";
        }
        if (contentType.contains("webp")) {
            return "avatar.webp";
        }
        return "avatar.jpg";
    }

    private String trimTrailingSlash(String value) {
        if (value == null) {
            return "";
        }
        if (value.endsWith("/")) {
            return value.substring(0, value.length() - 1);
        }
        return value;
    }
}

record SupabaseUploadResult(String storagePath, String publicUrl) {}
record SupabaseDownloadResult(byte[] content, String contentType) {}
record RemoteFile(String filename, String contentType, byte[] content) {}
