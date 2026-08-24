package com.example.ecp_api.controller.admin;

import com.example.ecp_api.dto.response.AdminFileResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.service.AdminFileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/files")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
@Tag(name = "Files", description = "File & Media Management APIs")
public class AdminFileController {

    private final AdminFileService adminFileService;

    @GetMapping
    @Operation(summary = "Get list of all images and media files in the database",
               description = "Queries images from User Profiles, Products, and Categories with filter and pagination support.")
    public ResponseEntity<PageResponse<AdminFileResponse>> getAllFiles(
            @RequestParam(value = "type", required = false, defaultValue = "ALL") String type,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "page", required = false, defaultValue = "1") int page,
            @RequestParam(value = "size", required = false, defaultValue = "20") int size) {

        return ResponseEntity.ok(adminFileService.getAllMediaFiles(type, keyword, page, size));
    }
}
