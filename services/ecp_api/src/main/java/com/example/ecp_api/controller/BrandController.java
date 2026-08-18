package com.example.ecp_api.controller;

import com.example.ecp_api.dto.request.BrandFilterRequest;
import com.example.ecp_api.dto.request.BrandRequest;
import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.dto.response.BrandResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.service.BrandService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import com.example.ecp_api.exception.AppException;
import java.util.List;

@RestController
@RequestMapping("/v1/brands")
@RequiredArgsConstructor
@Tag(name = "Brand Management", description = "APIs for managing product brands")
public class BrandController {

    private final BrandService brandService;

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    @Operation(summary = "Create a new brand (JSON)")
    public ResponseEntity<ApiResponse<BrandResponse>> createBrandJson(
            @Valid @RequestBody BrandRequest request) {
        BrandResponse response = brandService.createBrand(request, null);
        ApiResponse<BrandResponse> apiResponse = ApiResponse.<BrandResponse>builder()
                .success(true)
                .message("Brand created successfully")
                .data(response)
                .build();
        return new ResponseEntity<>(apiResponse, HttpStatus.CREATED);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    @Operation(summary = "Create a new brand (Multipart)")
    public ResponseEntity<ApiResponse<BrandResponse>> createBrandMultipart(
            @RequestPart(value = "brand") @Valid BrandRequest request,
            @RequestPart(value = "logoFile", required = false) MultipartFile logoFile) {
        BrandResponse response = brandService.createBrand(request, logoFile);
        ApiResponse<BrandResponse> apiResponse = ApiResponse.<BrandResponse>builder()
                .success(true)
                .message("Brand created successfully")
                .data(response)
                .build();
        return new ResponseEntity<>(apiResponse, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    @Operation(summary = "Get all brands with pagination and filtering")
    @Parameters({
            @Parameter(name = "page", description = "Page number (1-indexed)", example = "1", schema = @Schema(type = "integer", defaultValue = "1")),
            @Parameter(name = "size", description = "Number of items per page", example = "20", schema = @Schema(type = "integer", defaultValue = "20")),
            @Parameter(name = "sort", description = "Sorting criteria", example = "createdAt,desc")
    })
    public ResponseEntity<PageResponse<BrandResponse>> getAllBrands(
            BrandFilterRequest filter,
            @Parameter(hidden = true) @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(brandService.getAllBrands(filter, pageable));
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    @Operation(summary = "Get all active brands", description = "Retrieve list of all active brands without pagination.")
    public ResponseEntity<ApiResponse<List<BrandResponse>>> getActiveBrands() {
        List<BrandResponse> responses = brandService.getActiveBrands();
        ApiResponse<List<BrandResponse>> apiResponse = ApiResponse.<List<BrandResponse>>builder()
                .success(true)
                .message("Active brands fetched successfully")
                .data(responses)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    @Operation(summary = "Get brand by ID")
    public ResponseEntity<ApiResponse<BrandResponse>> getBrandById(@PathVariable("id") String id) {
        BrandResponse response = brandService.getBrandById(id);
        ApiResponse<BrandResponse> apiResponse = ApiResponse.<BrandResponse>builder()
                .success(true)
                .message("Brand fetched successfully")
                .data(response)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @PatchMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    @Operation(summary = "Update a brand (JSON)")
    public ResponseEntity<ApiResponse<BrandResponse>> updateBrandJson(
            @PathVariable("id") String id,
            @RequestBody BrandRequest request) {
        BrandResponse response = brandService.updateBrand(id, request, null);
        ApiResponse<BrandResponse> apiResponse = ApiResponse.<BrandResponse>builder()
                .success(true)
                .message("Brand updated successfully")
                .data(response)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @PatchMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    @Operation(summary = "Update a brand (Multipart)")
    public ResponseEntity<ApiResponse<BrandResponse>> updateBrandMultipart(
            @PathVariable("id") String id,
            @RequestPart(value = "brand") BrandRequest request,
            @RequestPart(value = "logoFile", required = false) MultipartFile logoFile) {
        BrandResponse response = brandService.updateBrand(id, request, logoFile);
        ApiResponse<BrandResponse> apiResponse = ApiResponse.<BrandResponse>builder()
                .success(true)
                .message("Brand updated successfully")
                .data(response)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    @Operation(summary = "Delete a brand")
    public ResponseEntity<ApiResponse<Void>> deleteBrand(@PathVariable("id") String id) {
        brandService.deleteBrand(id);
        ApiResponse<Void> apiResponse = ApiResponse.<Void>builder()
                .success(true)
                .message("Brand deleted successfully")
                .build();
        return ResponseEntity.ok(apiResponse);
    }
}
