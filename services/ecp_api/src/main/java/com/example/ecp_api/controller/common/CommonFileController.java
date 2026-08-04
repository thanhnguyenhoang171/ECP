package com.example.ecp_api.controller.common;

import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.exception.AppException;
import com.example.ecp_api.service.CloudinaryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/common/files")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
@Tag(name = "[COMMON] File Management", description = "Common file upload and management endpoints accessible by all authenticated users.")
public class CommonFileController {

    private final CloudinaryService cloudinaryService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a single file")
    public ResponseEntity<ApiResponse<Map>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", required = false) String folder,
            @Parameter(description = "Maximum allowed file size in bytes (optional). Default: 10MB, Max cap: 50MB", example = "10485760")
            @RequestParam(value = "maxSize", required = false) Long maxSize) {

        long limit = (maxSize != null) ? Math.min(maxSize, 50L * 1024 * 1024) : 10L * 1024 * 1024;

        if (file.getSize() > limit) {
            throw new AppException(
                    "FILE_SIZE_EXCEED",
                    "File size exceeds limit. Maximum allowed: " + (limit / 1024 / 1024) + "MB",
                    HttpStatus.BAD_REQUEST
            );
        }

        Map result = cloudinaryService.upload(file, folder);

        return ResponseEntity.ok(
                ApiResponse.<Map>builder()
                        .success(true)
                        .code("FILE_UPLOAD_SUCCESS")
                        .message("File uploaded successfully")
                        .data(result)
                        .build()
        );
    }

    @PostMapping(value = "/upload-multiple", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload multiple files")
    public ResponseEntity<ApiResponse<List<Map>>> uploadMultipleFiles(
            @RequestPart("files") MultipartFile[] files,
            @RequestParam(value = "folder", required = false) String folder,
            @Parameter(description = "Maximum allowed file size in bytes per file (optional). Default: 10MB, Max cap: 50MB", example = "10485760")
            @RequestParam(value = "maxSize", required = false) Long maxSize) {

        long limit = (maxSize != null) ? Math.min(maxSize, 50L * 1024 * 1024) : 10L * 1024 * 1024;

        for (MultipartFile file : files) {
            if (file.getSize() > limit) {
                throw new AppException(
                        "FILE_SIZE_EXCEED",
                        "File '" + file.getOriginalFilename() + "' exceeds limit. Maximum allowed: " + (limit / 1024 / 1024) + "MB",
                        HttpStatus.BAD_REQUEST
                );
            }
        }

        List<Map> results = cloudinaryService.uploadMultiple(files, folder);
        return ResponseEntity.ok(ApiResponse.<List<Map>>builder()
                .success(true)
                .code("FILES_UPLOAD_SUCCESS")
                .message("Files uploaded successfully")
                .data(results)
                .build()
        );
    }

    @DeleteMapping("/delete")
    @Operation(summary = "Delete a file by public_id")
    public ResponseEntity<ApiResponse<Void>> deleteFile(@RequestParam("public_id") String publicId) {
        cloudinaryService.delete(publicId);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .code("FILE_DELETED_SUCCESS")
                        .message("File deleted successfully")
                        .build()
        );
    }
}
