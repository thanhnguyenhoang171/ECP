package com.example.ecp_api.service.impl;

import com.example.ecp_api.dto.response.CloudinaryAsset;
import com.example.ecp_api.exception.AppException;
import com.example.ecp_api.service.CloudinaryService;
import com.example.ecp_api.service.MinioService;
import com.example.ecp_api.service.StorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * Delegating / Router Storage Service that dynamically routes upload and delete operations
 * between MinIO and Cloudinary based on environment flags:
 * - MINIO_SERVICE_ENABLE (default: true)
 * - CLOUDINARY_SERVICE_ENABLE (default: false)
 */
@Service
@Primary
@Slf4j
public class DelegatingStorageService implements StorageService, MinioService, CloudinaryService {

    private final MinioService minioService;
    private final CloudinaryService cloudinaryService;

    @Value("${storage.minio.enabled:true}")
    private boolean minioEnabled;

    @Value("${storage.cloudinary.enabled:false}")
    private boolean cloudinaryEnabled;

    public DelegatingStorageService(
            @Qualifier("minioStorageService") MinioService minioService,
            @Qualifier("cloudinaryStorageService") CloudinaryService cloudinaryService
    ) {
        this.minioService = minioService;
        this.cloudinaryService = cloudinaryService;
    }

    private StorageService getActiveUploadService() {
        if (minioEnabled) {
            return minioService;
        }
        if (cloudinaryEnabled) {
            return cloudinaryService;
        }
        log.error("All media storage services are disabled (MINIO_SERVICE_ENABLE=false and CLOUDINARY_SERVICE_ENABLE=false)");
        throw new AppException("STORAGE_DISABLED", "Tất cả dịch vụ lưu trữ đều đang tắt. Vui lòng bật MINIO_SERVICE_ENABLE hoặc CLOUDINARY_SERVICE_ENABLE.", HttpStatus.SERVICE_UNAVAILABLE);
    }

    @Override
    public Map<String, Object> upload(MultipartFile file, String folder) {
        StorageService service = getActiveUploadService();
        log.info("Routing upload to provider: {}", service instanceof MinioService ? "MinIO" : "Cloudinary");
        return service.upload(file, folder);
    }

    @Override
    public List<Map<String, Object>> uploadMultiple(MultipartFile[] files, String folder) {
        StorageService service = getActiveUploadService();
        log.info("Routing uploadMultiple to provider: {}", service instanceof MinioService ? "MinIO" : "Cloudinary");
        return service.uploadMultiple(files, folder);
    }

    @Override
    public void delete(String publicId) {
        if (!StringUtils.hasText(publicId)) {
            return;
        }

        // Tự động nhận diện provider:
        // MinIO object names thường có tiền tố folder: "ecp_uploads/..."
        // Cloudinary publicId cũng có thể có ecp_uploads, nhưng nếu URL hoặc ID là định dạng MinIO
        if (isMinioIdentifier(publicId)) {
            if (minioEnabled) {
                try {
                    minioService.delete(publicId);
                    return;
                } catch (Exception e) {
                    log.warn("Failed to delete from MinIO, attempting fallback: {}", e.getMessage());
                }
            }
        }

        if (cloudinaryEnabled) {
            try {
                cloudinaryService.delete(publicId);
                return;
            } catch (Exception e) {
                log.warn("Failed to delete from Cloudinary: {}", e.getMessage());
            }
        }

        // Fallback: nếu không match điều kiện trên, thử xóa trên provider đang active
        try {
            getActiveUploadService().delete(publicId);
        } catch (Exception e) {
            log.warn("Delete fallback failed for publicId '{}': {}", publicId, e.getMessage());
        }
    }

    @Override
    public void deleteByUrl(String url) {
        if (!StringUtils.hasText(url)) {
            return;
        }

        if (url.contains("cloudinary.com")) {
            if (cloudinaryEnabled) {
                cloudinaryService.deleteByUrl(url);
            } else {
                log.info("Cloudinary is disabled, skipping delete for Cloudinary URL: {}", url);
            }
            return;
        }

        if (minioEnabled) {
            minioService.deleteByUrl(url);
        } else if (cloudinaryEnabled) {
            cloudinaryService.deleteByUrl(url);
        }
    }

    @Override
    public Map<String, Object> generateUploadSignature(String folder) {
        return getActiveUploadService().generateUploadSignature(folder);
    }

    @Override
    public CloudinaryAsset uploadSafely(MultipartFile file, String folder) {
        try {
            return getActiveUploadService().uploadSafely(file, folder);
        } catch (Exception e) {
            log.error("uploadSafely failed: {}", e.getMessage());
            return null;
        }
    }

    @Override
    public List<CloudinaryAsset> uploadMultipleSafely(List<MultipartFile> files, String folder) {
        try {
            return getActiveUploadService().uploadMultipleSafely(files, folder);
        } catch (Exception e) {
            log.error("uploadMultipleSafely failed: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    @Override
    public void rollbackSafely(CloudinaryAsset asset) {
        if (asset == null || !StringUtils.hasText(asset.publicId())) {
            return;
        }
        delete(asset.publicId());
    }

    @Override
    public void rollbackSafely(String publicId) {
        delete(publicId);
    }

    @Override
    public void rollbackSafely(List<String> publicIds) {
        if (publicIds != null) {
            for (String pid : publicIds) {
                delete(pid);
            }
        }
    }

    @Override
    public void rollbackAssetsSafely(List<CloudinaryAsset> assets) {
        if (assets != null) {
            for (CloudinaryAsset a : assets) {
                rollbackSafely(a);
            }
        }
    }

    @Override
    public CloudinaryAsset uploadSafely(byte[] data, String folder) {
        try {
            return getActiveUploadService().uploadSafely(data, folder);
        } catch (Exception e) {
            log.error("uploadSafely byte array failed: {}", e.getMessage());
            return null;
        }
    }

    @Override
    public CloudinaryAsset uploadFromUrlSafely(String url, String folder) {
        try {
            return getActiveUploadService().uploadFromUrlSafely(url, folder);
        } catch (Exception e) {
            log.error("uploadFromUrlSafely failed: {}", e.getMessage());
            return null;
        }
    }

    @Override
    public String getPublicUrl(String objectName) {
        return getActiveUploadService().getPublicUrl(objectName);
    }

    private boolean isMinioIdentifier(String publicId) {
        // Pattern generated by MinioServiceImpl: "ecp_uploads/{folder}/{timestamp}_{uuid8}_{filename}"
        return publicId.matches(".*\\d{10,14}_[a-f0-9]{8}_.*") || minioEnabled;
    }
}
