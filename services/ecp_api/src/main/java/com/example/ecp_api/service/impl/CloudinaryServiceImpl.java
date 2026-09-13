package com.example.ecp_api.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.ecp_api.dto.response.CloudinaryAsset;
import com.example.ecp_api.exception.AppException;
import com.example.ecp_api.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.CompletableFuture;

import static java.util.concurrent.CompletableFuture.supplyAsync;
import static java.util.concurrent.Executors.newVirtualThreadPerTaskExecutor;

@Service("cloudinaryStorageService")
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
    public Map<String, Object> upload(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            throw new AppException("INVALID_PARAM", "File is empty", HttpStatus.BAD_REQUEST);
        }
        try {
            String folderPath = buildFolderPath(folder);
            Map<?, ?> rawResult = this.cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "resource_type", "auto",
                    "folder", folderPath
            ));

            String secureUrl = (String) rawResult.get("secure_url");
            String publicId = (String) rawResult.get("public_id");

            Map<String, Object> result = new HashMap<>();
            rawResult.forEach((k, v) -> result.put(String.valueOf(k), v));
            result.put("url", secureUrl);
            result.put("secure_url", secureUrl);
            result.put("public_id", publicId);
            result.put("original_filename", file.getOriginalFilename());

            log.info("Uploaded file successfully to Cloudinary: {} (public_id: {})", secureUrl, publicId);
            return result;
        } catch (IOException e) {
            log.error("Errors when uploading file to Cloudinary: {}", e.getMessage());
            throw new AppException("FILE_UPLOAD_FAILED", "Cannot upload file to Cloudinary: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
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

            log.info("Uploaded {} files in parallel to Cloudinary successfully", results.size());
            return results;
        }
    }

    @Override
    public void delete(String publicId) {
        if (!StringUtils.hasText(publicId)) {
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
                for (String resourceType : resourceTypes) {
                    Map<?, ?> params = ObjectUtils.asMap("resource_type", resourceType, "invalidate", true);
                    Map<?, ?> result = this.cloudinary.uploader().destroy(candidate, params);
                    String status = (String) result.get("result");

                    if ("ok".equalsIgnoreCase(status)) {
                        log.info("Delete file successfully from Cloudinary: {} (resource_type: {})", candidate, resourceType);
                        deleted = true;
                        break;
                    }
                }
                if (deleted) break;
            }

            if (!deleted) {
                log.warn("Cloudinary delete failed for publicId '{}' (candidates tested: {})", publicId, candidates);
            }
        } catch (Exception e) {
            log.error("Errors when deleting file from Cloudinary {}: {}", publicId, e.getMessage());
            throw new AppException("FILE_DELETE_FAILED", "Failed to delete file from Cloudinary: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public void deleteByUrl(String url) {
        if (!StringUtils.hasText(url)) {
            throw new AppException("INVALID_PARAM", "URL cannot be empty", HttpStatus.BAD_REQUEST);
        }
        String publicId = extractPublicIdFromUrl(url);
        if (StringUtils.hasText(publicId)) {
            delete(publicId);
        } else {
            log.warn("Could not extract Cloudinary public_id from URL: {}", url);
        }
    }

    @Override
    public Map<String, Object> generateUploadSignature(String folder) {
        long timestamp = System.currentTimeMillis() / 1000L;
        String folderPath = buildFolderPath(folder);

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
        if (file == null || file.isEmpty()) return null;
        try {
            Map<String, Object> result = this.upload(file, folder);
            if (result != null && result.containsKey("url")) {
                return new CloudinaryAsset((String) result.get("url"), (String) result.get("public_id"));
            }
        } catch (Exception e) {
            log.error("Cloudinary uploadSafely failed: {}", e.getMessage());
        }
        return null;
    }

    @Override
    public List<CloudinaryAsset> uploadMultipleSafely(List<MultipartFile> files, String folder) {
        if (files == null || files.isEmpty()) return Collections.emptyList();
        List<CloudinaryAsset> assets = new ArrayList<>();
        for (MultipartFile file : files) {
            CloudinaryAsset asset = this.uploadSafely(file, folder);
            if (asset != null) assets.add(asset);
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
                log.error("Failed to rollback Cloudinary asset {}: {}", publicId, ex.getMessage());
            }
        }
    }

    @Override
    public void rollbackSafely(List<String> publicIds) {
        if (publicIds != null) {
            for (String pid : publicIds) rollbackSafely(pid);
        }
    }

    @Override
    public void rollbackAssetsSafely(List<CloudinaryAsset> assets) {
        if (assets != null) {
            for (CloudinaryAsset a : assets) rollbackSafely(a);
        }
    }

    @Override
    public CloudinaryAsset uploadSafely(byte[] data, String folder) {
        if (data == null || data.length == 0) return null;
        try {
            String folderPath = buildFolderPath(folder);
            Map<?, ?> uploadResult = this.cloudinary.uploader().upload(data, ObjectUtils.asMap(
                    "resource_type", "auto",
                    "folder", folderPath
            ));
            return new CloudinaryAsset((String) uploadResult.get("secure_url"), (String) uploadResult.get("public_id"));
        } catch (Exception e) {
            log.error("Cloudinary byte uploadSafely failed: {}", e.getMessage());
            return null;
        }
    }

    @Override
    public CloudinaryAsset uploadFromUrlSafely(String url, String folder) {
        if (!StringUtils.hasText(url) || !url.trim().startsWith("http")) return null;
        try {
            String folderPath = buildFolderPath(folder);
            Map<?, ?> uploadResult = this.cloudinary.uploader().upload(url.trim(), ObjectUtils.asMap(
                    "resource_type", "auto",
                    "folder", folderPath
            ));
            return new CloudinaryAsset((String) uploadResult.get("secure_url"), (String) uploadResult.get("public_id"));
        } catch (Exception e) {
            log.error("Failed to upload URL to Cloudinary: {}", e.getMessage());
            return null;
        }
    }

    @Override
    public String getPublicUrl(String objectName) {
        return String.format("https://res.cloudinary.com/%s/image/upload/%s", cloudName, objectName);
    }

    private String buildFolderPath(String folder) {
        String folderPath = "ecp_uploads";
        if (StringUtils.hasText(folder)) {
            String subFolder = folder.trim();
            while (subFolder.startsWith("/")) subFolder = subFolder.substring(1);
            while (subFolder.endsWith("/")) subFolder = subFolder.substring(0, subFolder.length() - 1);
            if (!subFolder.isEmpty()) folderPath = folderPath + "/" + subFolder;
        }
        return folderPath;
    }

    private String extractPublicIdFromUrl(String url) {
        if (!url.contains("/upload/")) return null;
        try {
            String path = url.substring(url.indexOf("/upload/") + 8);
            String[] parts = path.split("/");
            StringBuilder builder = new StringBuilder();
            for (String part : parts) {
                if (part.contains(",") || part.startsWith("c_") || part.startsWith("w_") || part.startsWith("h_") || part.startsWith("f_") || part.startsWith("q_")) continue;
                if (part.matches("v\\d+")) continue;
                if (builder.length() > 0) builder.append("/");
                builder.append(part);
            }
            String publicIdWithExt = builder.toString();
            int lastDotIndex = publicIdWithExt.lastIndexOf(".");
            return lastDotIndex > 0 ? publicIdWithExt.substring(0, lastDotIndex) : publicIdWithExt;
        } catch (Exception e) {
            return null;
        }
    }
}
