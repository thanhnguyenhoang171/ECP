package com.example.ecp_api.dto.response;

/**
 * Record representing an uploaded media asset on Cloudinary.
 *
 * @param url      The optimized secure URL of the asset
 * @param publicId The Cloudinary public ID of the asset
 */
public record CloudinaryAsset(String url, String publicId) {}
