package com.example.ecp_api.service;

import com.example.ecp_api.dto.response.CloudinaryAsset;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface StorageService {
    Map<String, Object> upload(MultipartFile file, String folder);
    List<Map<String, Object>> uploadMultiple(MultipartFile[] files, String folder);
    void delete(String publicId);
    void deleteByUrl(String url);
    Map<String, Object> generateUploadSignature(String folder);

    CloudinaryAsset uploadSafely(MultipartFile file, String folder);
    List<CloudinaryAsset> uploadMultipleSafely(List<MultipartFile> files, String folder);
    void rollbackSafely(CloudinaryAsset asset);
    void rollbackSafely(String publicId);
    void rollbackSafely(List<String> publicIds);
    void rollbackAssetsSafely(List<CloudinaryAsset> assets);
    CloudinaryAsset uploadSafely(byte[] data, String folder);
    CloudinaryAsset uploadFromUrlSafely(String url, String folder);
    String getPublicUrl(String objectName);
}
