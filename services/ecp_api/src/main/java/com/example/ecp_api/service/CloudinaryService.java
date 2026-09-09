package com.example.ecp_api.service;

import com.example.ecp_api.dto.response.CloudinaryAsset;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface CloudinaryService {
    Map upload(MultipartFile file, String folder);
    List<Map> uploadMultiple(MultipartFile[] files, String folder);
    void delete(String publicId);
    void deleteByUrl(String url);
    Map<String, Object> generateUploadSignature(String folder);

    /**
     * Safely upload a single file to Cloudinary.
     * Returns null if file is null or empty.
     */
    CloudinaryAsset uploadSafely(MultipartFile file, String folder);

    /**
     * Safely upload multiple files to Cloudinary.
     * Returns a list of uploaded assets.
     */
    List<CloudinaryAsset> uploadMultipleSafely(List<MultipartFile> files, String folder);

    /**
     * Safely rollback/delete an uploaded asset without throwing exceptions.
     */
    void rollbackSafely(CloudinaryAsset asset);

    /**
     * Safely rollback/delete an asset by publicId without throwing exceptions.
     */
    void rollbackSafely(String publicId);

    /**
     * Safely rollback/delete multiple assets by publicIds without throwing exceptions.
     */
    void rollbackSafely(List<String> publicIds);

    /**
     * Safely rollback/delete multiple assets without throwing exceptions.
     */
    void rollbackAssetsSafely(List<CloudinaryAsset> assets);

    /**
     * Safely upload raw byte array (e.g. from Excel embedded images) to Cloudinary.
     */
    CloudinaryAsset uploadSafely(byte[] data, String folder);

    /**
     * Safely upload image from a remote URL to Cloudinary.
     */
    CloudinaryAsset uploadFromUrlSafely(String url, String folder);
}
