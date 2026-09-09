package com.example.ecp_api.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.ecp_api.dto.response.CloudinaryAsset;
import com.example.ecp_api.exception.AppException;
import com.example.ecp_api.service.CloudinaryService;
import com.example.ecp_api.util.CloudinaryUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

import static java.util.concurrent.CompletableFuture.supplyAsync;
import static java.util.concurrent.Executors.newVirtualThreadPerTaskExecutor;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryServiceImpl implements CloudinaryService {
    private final Cloudinary cloudinary;

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${cloudinary.api-key:}")
    private String apiKey;

    @Value("${cloudinary.api-secret:}")
    private String apiSecret;

    @Override
    public Map upload(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }
        try {
            String folderPath = "ecp_uploads";
            if (folder != null && !folder.trim().isEmpty()) {
                String subFolder = folder.trim();
                while (subFolder.startsWith("/")) {
                    subFolder = subFolder.substring(1);
                }
                while (subFolder.endsWith("/")) {
                    subFolder = subFolder.substring(0, subFolder.length() - 1);
                }
                if (!subFolder.isEmpty()) {
                    folderPath = folderPath + "/" + subFolder;
                }
            }
            // Upload to cloudinary
            Map uploadResult  = this.cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "resource_type", "auto",
                    "folder", folderPath
            ));

            // Get secure_url and optimized it by util
            String secureUrl = (String) uploadResult.get("secure_url");
            String optimizeUrl = CloudinaryUtils.optimizeURL(secureUrl);

            // Update result map to return opt URL
            uploadResult.put("secure_url", optimizeUrl);

            log.info("Upload file successfully : {}", optimizeUrl);

            return uploadResult;
        } catch (IOException e) {
            log.error("Errors when uploading file to Cloudinary: {}", e.getMessage());
            throw new RuntimeException("Cannot upload file to Cloudinary");
        }
    }

    @Override
    public List<Map> uploadMultiple(MultipartFile[] files, String folder) {
        if (files == null || files.length == 0) {
            return Collections.emptyList();
        }

        List<MultipartFile> validFiles = java.util.Arrays.stream(files)
                .filter(f -> f != null && !f.isEmpty())
                .toList();

        if (validFiles.isEmpty()) {
            return Collections.emptyList();
        }

        // Parallel asynchronous upload using Virtual Threads (Java 21+)
        try (var executor = newVirtualThreadPerTaskExecutor()) {
            List<CompletableFuture<Map>> futures = validFiles.stream()
                    .map(file -> supplyAsync(() -> this.upload(file, folder), executor))
                    .toList();

            List<Map> uploadResults = futures.stream()
                    .map(CompletableFuture::join)
                    .toList();

            log.info("Uploaded {} files in parallel successfully", uploadResults.size());
            return uploadResults;
        }
    }

    @Override
    public void delete(String publicId) {
        if (publicId == null || publicId.trim().isEmpty()) {
            throw new AppException("INVALID_PARAM", "Public ID cannot be empty", HttpStatus.BAD_REQUEST);
        }

        String cleanPublicId = publicId.trim();
        while (cleanPublicId.startsWith("/")) {
            cleanPublicId = cleanPublicId.substring(1);
        }

        List<String> candidates = new ArrayList<>();
        candidates.add(cleanPublicId);

        if (cleanPublicId.contains("/")) {
            String shortId = cleanPublicId.substring(cleanPublicId.lastIndexOf('/') + 1);
            if (!shortId.isEmpty() && !candidates.contains(shortId)) {
                candidates.add(shortId);
            }
        } else {
            candidates.add("ecp_uploads/" + cleanPublicId);
            candidates.add("ecp_uploads/avatars/" + cleanPublicId);
            candidates.add("ecp_uploads/products/" + cleanPublicId);
            candidates.add("ecp_uploads/categories/" + cleanPublicId);
        }

        String[] resourceTypes = new String[]{"image", "video", "raw"};

        try {
            boolean deleted = false;
            for (String candidate : candidates) {
                log.info("Attempting to delete file from Cloudinary with candidate publicId: {}", candidate);
                for (String resourceType : resourceTypes) {
                    Map params = ObjectUtils.asMap("resource_type", resourceType, "invalidate", true);
                    Map result = this.cloudinary.uploader().destroy(candidate, params);
                    log.info("Cloudinary destroy response [{}] for candidate '{}': {}", resourceType, candidate, result);
                    String status = (String) result.get("result");

                    if ("ok".equalsIgnoreCase(status)) {
                        log.info("Delete file successfully from Cloudinary: {} (resource_type: {})", candidate, resourceType);
                        deleted = true;
                        break;
                    }
                }
                if (deleted) {
                    break;
                }
            }

            if (!deleted) {
                log.warn("Cloudinary delete failed for publicId '{}' (candidates tested: {})", publicId, candidates);
                throw new AppException("FILE_NOT_FOUND", "File with public_id '" + publicId + "' was not found on Cloudinary.", HttpStatus.NOT_FOUND);
            }
        } catch (AppException ae) {
            throw ae;
        } catch (Exception e) {
            log.error("Errors when deleting file from Cloudinary {}: {}", publicId, e.getMessage());
            throw new AppException("FILE_DELETE_FAILED", "Failed to delete file from Cloudinary: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public void deleteByUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            throw new AppException("INVALID_PARAM", "URL cannot be empty", HttpStatus.BAD_REQUEST);
        }
        String publicId = CloudinaryUtils.extractPublicId(url);
        if (publicId != null && !publicId.trim().isEmpty()) {
            delete(publicId);
        } else {
            log.warn("Could not extract public_id from URL: {}", url);
            throw new AppException("INVALID_URL", "Could not extract public_id from URL: " + url, HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    public Map<String, Object> generateUploadSignature(String folder) {
        long timestamp = System.currentTimeMillis() / 1000L;

        String folderPath = "ecp_uploads";
        if (folder != null && !folder.trim().isEmpty()) {
            String subFolder = folder.trim();
            while (subFolder.startsWith("/")) {
                subFolder = subFolder.substring(1);
            }
            while (subFolder.endsWith("/")) {
                subFolder = subFolder.substring(0, subFolder.length() - 1);
            }
            if (!subFolder.isEmpty()) {
                folderPath = folderPath + "/" + subFolder;
            }
        }

        Map<String, Object> paramsToSign = new HashMap<>();
        paramsToSign.put("timestamp", timestamp);
        paramsToSign.put("folder", folderPath);

        String signature = cloudinary.apiSignRequest(paramsToSign, apiSecret);

        Map<String, Object> result = new HashMap<>();
        result.put("signature", signature);
        result.put("timestamp", timestamp);
        result.put("apiKey", apiKey);
        result.put("cloudName", cloudName);
        result.put("folder", folderPath);

        log.info("Generated upload signature for folder: {}", folderPath);
        return result;
    }

    @Override
    public CloudinaryAsset uploadSafely(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            return null;
        }
        Map<?, ?> result = this.upload(file, folder);
        if (result != null && result.containsKey("secure_url")) {
            return new CloudinaryAsset(
                    (String) result.get("secure_url"),
                    (String) result.get("public_id")
            );
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
        if (asset != null && asset.publicId() != null && !asset.publicId().trim().isEmpty()) {
            rollbackSafely(asset.publicId());
        }
    }

    @Override
    public void rollbackSafely(String publicId) {
        if (publicId != null && !publicId.trim().isEmpty()) {
            try {
                this.delete(publicId);
            } catch (Exception ex) {
                log.error("Failed to rollback Cloudinary asset {}: {}", publicId, ex.getMessage());
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
            String folderPath = "ecp_uploads";
            if (folder != null && !folder.trim().isEmpty()) {
                String subFolder = folder.trim();
                while (subFolder.startsWith("/")) subFolder = subFolder.substring(1);
                while (subFolder.endsWith("/")) subFolder = subFolder.substring(0, subFolder.length() - 1);
                if (!subFolder.isEmpty()) {
                    folderPath = folderPath + "/" + subFolder;
                }
            }
            Map uploadResult = this.cloudinary.uploader().upload(data, ObjectUtils.asMap(
                    "resource_type", "auto",
                    "folder", folderPath
            ));
            String secureUrl = (String) uploadResult.get("secure_url");
            String publicId = (String) uploadResult.get("public_id");
            String optimizedUrl = CloudinaryUtils.optimizeURL(secureUrl);
            return new CloudinaryAsset(optimizedUrl, publicId);
        } catch (Exception e) {
            log.error("Cloudinary upload failed: {}", e.getMessage(), e);
            return null;
        }
    }

    @Override
    public CloudinaryAsset uploadFromUrlSafely(String url, String folder) {
        if (url == null || url.trim().isEmpty() || !url.trim().startsWith("http")) {
            return null;
        }
        try {
            String folderPath = "ecp_uploads";
            if (folder != null && !folder.trim().isEmpty()) {
                String subFolder = folder.trim();
                while (subFolder.startsWith("/")) subFolder = subFolder.substring(1);
                while (subFolder.endsWith("/")) subFolder = subFolder.substring(0, subFolder.length() - 1);
                if (!subFolder.isEmpty()) {
                    folderPath = folderPath + "/" + subFolder;
                }
            }
            Map uploadResult = this.cloudinary.uploader().upload(url.trim(), ObjectUtils.asMap(
                    "resource_type", "auto",
                    "folder", folderPath
            ));
            String secureUrl = (String) uploadResult.get("secure_url");
            String publicId = (String) uploadResult.get("public_id");
            String optimizedUrl = CloudinaryUtils.optimizeURL(secureUrl);
            return new CloudinaryAsset(optimizedUrl, publicId);
        } catch (Exception e) {
            log.error("Failed to upload URL to Cloudinary: {}", e.getMessage());
            return null;
        }
    }
}
