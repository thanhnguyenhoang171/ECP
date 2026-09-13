package com.example.ecp_api.service.impl;

import com.example.ecp_api.config.MinioConfig;
import com.example.ecp_api.dto.response.CloudinaryAsset;
import com.example.ecp_api.exception.AppException;
import com.example.ecp_api.service.CloudinaryService;
import com.example.ecp_api.service.MinioService;
import io.minio.*;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

import static java.util.concurrent.CompletableFuture.supplyAsync;
import static java.util.concurrent.Executors.newVirtualThreadPerTaskExecutor;

@Service("minioStorageService")
@RequiredArgsConstructor
@Slf4j
public class MinioServiceImpl implements MinioService {

    private final MinioClient minioClient;
    private final MinioConfig minioConfig;

    @Override
    public Map<String, Object> upload(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            throw new AppException("INVALID_PARAM", "File is empty", HttpStatus.BAD_REQUEST);
        }

        try {
            String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
            String cleanName = originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
            String extension = "";
            int dotIdx = cleanName.lastIndexOf('.');
            if (dotIdx > 0) {
                extension = cleanName.substring(dotIdx + 1).toLowerCase();
            }

            String objectName = buildObjectName(folder, cleanName);
            String contentType = file.getContentType();
            if (!StringUtils.hasText(contentType)) {
                contentType = "application/octet-stream";
            }

            try (InputStream inputStream = file.getInputStream()) {
                minioClient.putObject(
                        PutObjectArgs.builder()
                                .bucket(minioConfig.getBucketName())
                                .object(objectName)
                                .stream(inputStream, file.getSize(), -1)
                                .contentType(contentType)
                                .build()
                );
            }

            String publicUrl = getPublicUrl(objectName);
            log.info("Upload file successfully to MinIO: {} (object: {})", publicUrl, objectName);

            Map<String, Object> result = new HashMap<>();
            result.put("url", publicUrl);
            result.put("secure_url", publicUrl);
            result.put("public_id", objectName);
            result.put("original_filename", originalFilename);
            result.put("bytes", file.getSize());
            result.put("format", extension);
            result.put("resource_type", contentType.startsWith("image/") ? "image" : "raw");

            return result;
        } catch (AppException ae) {
            throw ae;
        } catch (Exception e) {
            log.error("Errors when uploading file to MinIO: {}", e.getMessage(), e);
            throw new AppException("FILE_UPLOAD_FAILED", "Cannot upload file to MinIO: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public List<Map<String, Object>> uploadMultiple(MultipartFile[] files, String folder) {
        if (files == null || files.length == 0) {
            return Collections.emptyList();
        }

        List<MultipartFile> validFiles = Arrays.stream(files)
                .filter(f -> f != null && !f.isEmpty())
                .toList();

        if (validFiles.isEmpty()) {
            return Collections.emptyList();
        }

        try (var executor = newVirtualThreadPerTaskExecutor()) {
            List<CompletableFuture<Map<String, Object>>> futures = validFiles.stream()
                    .map(file -> supplyAsync(() -> this.upload(file, folder), executor))
                    .toList();

            List<Map<String, Object>> results = futures.stream()
                    .map(CompletableFuture::join)
                    .toList();

            log.info("Uploaded {} files in parallel to MinIO successfully", results.size());
            return results;
        }
    }

    @Override
    public void delete(String publicId) {
        if (!StringUtils.hasText(publicId)) {
            throw new AppException("INVALID_PARAM", "Public ID (objectName) cannot be empty", HttpStatus.BAD_REQUEST);
        }

        String cleanPublicId = publicId.trim();
        while (cleanPublicId.startsWith("/")) {
            cleanPublicId = cleanPublicId.substring(1);
        }

        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(minioConfig.getBucketName())
                            .object(cleanPublicId)
                            .build()
            );
            log.info("Delete file successfully from MinIO: {}", cleanPublicId);
        } catch (Exception e) {
            log.error("Errors when deleting file from MinIO {}: {}", cleanPublicId, e.getMessage());
            throw new AppException("FILE_DELETE_FAILED", "Failed to delete file from MinIO: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public void deleteByUrl(String url) {
        if (!StringUtils.hasText(url)) {
            throw new AppException("INVALID_PARAM", "URL cannot be empty", HttpStatus.BAD_REQUEST);
        }

        String objectName = extractObjectNameFromUrl(url);
        if (StringUtils.hasText(objectName)) {
            delete(objectName);
        } else {
            log.warn("Could not extract MinIO objectName from URL: {}", url);
        }
    }

    @Override
    public Map<String, Object> generateUploadSignature(String folder) {
        try {
            String objectName = buildObjectName(folder, UUID.randomUUID() + ".bin");
            String presignedUrl = minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.PUT)
                            .bucket(minioConfig.getBucketName())
                            .object(objectName)
                            .expiry(15, TimeUnit.MINUTES)
                            .build()
            );

            String publicUrl = getPublicUrl(objectName);

            Map<String, Object> result = new HashMap<>();
            result.put("uploadUrl", presignedUrl);
            result.put("publicUrl", publicUrl);
            result.put("publicId", objectName);
            result.put("folder", folder);

            return result;
        } catch (Exception e) {
            log.error("Failed to generate presigned upload URL: {}", e.getMessage());
            throw new AppException("SIGNATURE_FAILED", "Failed to generate presigned URL: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public CloudinaryAsset uploadSafely(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            return null;
        }
        try {
            Map<String, Object> result = this.upload(file, folder);
            if (result != null && result.containsKey("url")) {
                return new CloudinaryAsset(
                        (String) result.get("url"),
                        (String) result.get("public_id")
                );
            }
        } catch (Exception e) {
            log.error("MinIO uploadSafely failed: {}", e.getMessage());
        }
        return null;
    }

    @Override
    public List<CloudinaryAsset> uploadMultipleSafely(List<MultipartFile> files, String folder) {
        if (files == null || files.isEmpty()) {
            return Collections.emptyList();
        }
        List<CloudinaryAsset> assets = new ArrayList<>();
        for (MultipartFile file : files) {
            CloudinaryAsset asset = this.uploadSafely(file, folder);
            if (asset != null) {
                assets.add(asset);
            }
        }
        return assets;
    }

    @Override
    public void rollbackSafely(CloudinaryAsset asset) {
        if (asset != null && StringUtils.hasText(asset.publicId())) {
            rollbackSafely(asset.publicId());
        }
    }

    @Override
    public void rollbackSafely(String publicId) {
        if (StringUtils.hasText(publicId)) {
            try {
                this.delete(publicId);
            } catch (Exception ex) {
                log.error("Failed to rollback MinIO asset {}: {}", publicId, ex.getMessage());
            }
        }
    }

    @Override
    public void rollbackSafely(List<String> publicIds) {
        if (publicIds != null && !publicIds.isEmpty()) {
            for (String publicId : publicIds) {
                rollbackSafely(publicId);
            }
        }
    }

    @Override
    public void rollbackAssetsSafely(List<CloudinaryAsset> assets) {
        if (assets != null && !assets.isEmpty()) {
            for (CloudinaryAsset asset : assets) {
                rollbackSafely(asset);
            }
        }
    }

    @Override
    public CloudinaryAsset uploadSafely(byte[] data, String folder) {
        if (data == null || data.length == 0) {
            return null;
        }
        try {
            String objectName = buildObjectName(folder, UUID.randomUUID() + ".png");
            try (ByteArrayInputStream bais = new ByteArrayInputStream(data)) {
                minioClient.putObject(
                        PutObjectArgs.builder()
                                .bucket(minioConfig.getBucketName())
                                .object(objectName)
                                .stream(bais, data.length, -1)
                                .contentType("image/png")
                                .build()
                );
            }
            String publicUrl = getPublicUrl(objectName);
            log.info("Uploaded bytes safely to MinIO: {}", publicUrl);
            return new CloudinaryAsset(publicUrl, objectName);
        } catch (Exception e) {
            log.error("MinIO byte uploadSafely failed: {}", e.getMessage(), e);
            return null;
        }
    }

    @Override
    public CloudinaryAsset uploadFromUrlSafely(String url, String folder) {
        if (!StringUtils.hasText(url) || !url.trim().startsWith("http")) {
            return null;
        }
        try {
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(10))
                    .build();

            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(url.trim()))
                    .timeout(Duration.ofSeconds(15))
                    .GET()
                    .build();

            HttpResponse<byte[]> res = client.send(req, HttpResponse.BodyHandlers.ofByteArray());
            if (res.statusCode() == 200 && res.body() != null && res.body().length > 0) {
                String contentType = res.headers().firstValue("Content-Type").orElse("image/jpeg");
                String ext = ".jpg";
                if (contentType.contains("png")) ext = ".png";
                else if (contentType.contains("webp")) ext = ".webp";
                else if (contentType.contains("gif")) ext = ".gif";

                String objectName = buildObjectName(folder, UUID.randomUUID() + ext);
                try (ByteArrayInputStream bais = new ByteArrayInputStream(res.body())) {
                    minioClient.putObject(
                            PutObjectArgs.builder()
                                    .bucket(minioConfig.getBucketName())
                                    .object(objectName)
                                    .stream(bais, res.body().length, -1)
                                    .contentType(contentType)
                                    .build()
                    );
                }
                String publicUrl = getPublicUrl(objectName);
                log.info("Uploaded URL asset safely to MinIO: {}", publicUrl);
                return new CloudinaryAsset(publicUrl, objectName);
            }
        } catch (Exception e) {
            log.error("Failed to upload remote URL to MinIO {}: {}", url, e.getMessage());
        }
        return null;
    }

    @Override
    public String getPublicUrl(String objectName) {
        String cleanObject = objectName.startsWith("/") ? objectName.substring(1) : objectName;
        String bucketName = minioConfig.getBucketName();
        String publicBaseUrl = minioConfig.getPublicUrl();

        if (StringUtils.hasText(publicBaseUrl)) {
            String cleanBase = publicBaseUrl.endsWith("/")
                    ? publicBaseUrl.substring(0, publicBaseUrl.length() - 1)
                    : publicBaseUrl;

            // Nếu publicBaseUrl đã bao gồm tên bucket
            if (cleanBase.endsWith("/" + bucketName)) {
                return cleanBase + "/" + cleanObject;
            }
            return cleanBase + "/" + bucketName + "/" + cleanObject;
        }

        // Fallback tới MinIO endpoint trực tiếp (như ValoPro)
        String rawEndpoint = minioConfig.getEndpoint();
        String protocol = minioConfig.isUseSsl() ? "https" : "http";

        if (rawEndpoint.startsWith("http://") || rawEndpoint.startsWith("https://")) {
            String cleanEndpoint = rawEndpoint.endsWith("/")
                    ? rawEndpoint.substring(0, rawEndpoint.length() - 1)
                    : rawEndpoint;
            return String.format("%s/%s/%s", cleanEndpoint, bucketName, cleanObject);
        }

        return String.format("%s://%s/%s/%s", protocol, rawEndpoint, bucketName, cleanObject);
    }

    private String buildObjectName(String folder, String filename) {
        String baseFolder = "ecp_uploads";
        if (StringUtils.hasText(folder)) {
            String cleanSub = folder.trim();
            while (cleanSub.startsWith("/")) cleanSub = cleanSub.substring(1);
            while (cleanSub.endsWith("/")) cleanSub = cleanSub.substring(0, cleanSub.length() - 1);
            if (!cleanSub.isEmpty()) {
                baseFolder = baseFolder + "/" + cleanSub;
            }
        }
        long timestamp = System.currentTimeMillis();
        String uniqueSuffix = UUID.randomUUID().toString().substring(0, 8);
        return String.format("%s/%d_%s_%s", baseFolder, timestamp, uniqueSuffix, filename);
    }

    private String extractObjectNameFromUrl(String url) {
        if (!StringUtils.hasText(url)) return null;
        String bucketName = minioConfig.getBucketName();
        String bucketTarget = "/" + bucketName + "/";
        if (url.contains(bucketTarget)) {
            return url.substring(url.indexOf(bucketTarget) + bucketTarget.length());
        }
        if (url.contains("ecp_uploads/")) {
            return url.substring(url.indexOf("ecp_uploads/"));
        }
        return null;
    }
}
