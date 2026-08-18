package com.example.ecp_api.controller;

import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.service.CloudinaryService;
import io.swagger.v3.oas.annotations.Hidden;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * DEPRECATED: Direct file upload API endpoints have been removed to prevent orphaned files on Cloudinary.
 * File uploads are now handled atomically within specific entity management endpoints (e.g. Product creation).
 */
@RestController
@RequestMapping("/v1/files")
@RequiredArgsConstructor
@Hidden
public class FileController {
    private final CloudinaryService cloudinaryService;

    // Direct upload endpoints removed. Use business endpoints (e.g. POST /v1/products) with multipart/form-data.
}

