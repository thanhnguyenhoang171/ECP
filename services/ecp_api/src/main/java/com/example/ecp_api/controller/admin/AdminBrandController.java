package com.example.ecp_api.controller.admin;

import com.example.ecp_api.dto.request.BrandFilterRequest;
import com.example.ecp_api.dto.request.BrandRequest;
import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.dto.response.BrandAdminResponse;
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

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/v1/brands")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('brand:read') or hasRole('SUPER_ADMIN')")
@Tag(name = "Brands", description = "Brand Management APIs")
public class AdminBrandController {

    private final BrandService brandService;

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Create a new brand (JSON)")
    public ResponseEntity<ApiResponse<BrandAdminResponse>> createBrandJson(@Valid @RequestBody BrandRequest request) {
        return new ResponseEntity<>(ApiResponse.<BrandAdminResponse>builder()
                .success(true).message("Brand created successfully")
                .data(brandService.createBrandAdmin(request, null)).build(), HttpStatus.CREATED);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Create a new brand (Multipart)")
    public ResponseEntity<ApiResponse<BrandAdminResponse>> createBrandMultipart(
            @RequestPart("brand") @Valid BrandRequest request,
            @RequestPart(value = "logoFile", required = false) MultipartFile logoFile) {
        return new ResponseEntity<>(ApiResponse.<BrandAdminResponse>builder()
                .success(true).message("Brand created successfully")
                .data(brandService.createBrandAdmin(request, logoFile)).build(), HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get all brands with pagination and filtering")
    @Parameters({
            @Parameter(name = "page", description = "Page number (1-indexed)", example = "1", schema = @Schema(type = "integer", defaultValue = "1")),
            @Parameter(name = "size", description = "Number of items per page", example = "20", schema = @Schema(type = "integer", defaultValue = "20")),
            @Parameter(name = "sort", description = "Sorting criteria", example = "createdAt,desc")
    })
    public ResponseEntity<PageResponse<BrandAdminResponse>> getAllBrands(
            BrandFilterRequest filter,
            @Parameter(hidden = true) @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(brandService.getAllBrandsAdmin(filter, pageable));
    }

    @GetMapping("/active")
    @Operation(summary = "Get all active brands")
    public ResponseEntity<ApiResponse<List<BrandAdminResponse>>> getActiveBrands() {
        return ResponseEntity.ok(ApiResponse.<List<BrandAdminResponse>>builder()
                .success(true).message("Active brands fetched successfully")
                .data(brandService.getActiveBrandsAdmin()).build());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get brand by ID")
    public ResponseEntity<ApiResponse<BrandAdminResponse>> getBrandById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.<BrandAdminResponse>builder()
                .success(true).message("Brand fetched successfully")
                .data(brandService.getBrandByIdAdmin(id)).build());
    }

    @PatchMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Update a brand (JSON)")
    public ResponseEntity<ApiResponse<BrandAdminResponse>> updateBrandJson(
            @PathVariable String id, @RequestBody BrandRequest request) {
        return ResponseEntity.ok(ApiResponse.<BrandAdminResponse>builder()
                .success(true).message("Brand updated successfully")
                .data(brandService.updateBrandAdmin(id, request, null)).build());
    }

    @PatchMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Update a brand (Multipart)")
    public ResponseEntity<ApiResponse<BrandAdminResponse>> updateBrandMultipart(
            @PathVariable String id,
            @RequestPart("brand") BrandRequest request,
            @RequestPart(value = "logoFile", required = false) MultipartFile logoFile) {
        return ResponseEntity.ok(ApiResponse.<BrandAdminResponse>builder()
                .success(true).message("Brand updated successfully")
                .data(brandService.updateBrandAdmin(id, request, logoFile)).build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a brand")
    public ResponseEntity<ApiResponse<Void>> deleteBrand(@PathVariable String id) {
        brandService.deleteBrand(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true).message("Brand deleted successfully").build());
    }
}
