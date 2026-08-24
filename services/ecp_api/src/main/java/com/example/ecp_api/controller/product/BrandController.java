package com.example.ecp_api.controller.product;

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
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/v1/brands")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('brand:read') or hasRole('SUPER_ADMIN')")
@Tag(name = "Brands", description = "Brand Management APIs")
public class BrandController {

    private final BrandService brandService;

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasAuthority('brand:create') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Create a new brand (JSON)")
    public ResponseEntity<ApiResponse<BrandResponse>> createBrandJson(@Valid @RequestBody BrandRequest request) {
        return new ResponseEntity<>(ApiResponse.<BrandResponse>builder()
                .success(true)
                .code("BRAND_CREATED_SUCCESS")
                .message("Brand created successfully")
                .data(brandService.createBrand(request, null)).build(), HttpStatus.CREATED);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('brand:create') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Create a new brand (Multipart)")
    public ResponseEntity<ApiResponse<BrandResponse>> createBrandMultipart(
            @RequestPart("brand") @Valid BrandRequest request,
            @RequestPart(value = "logoFile", required = false) MultipartFile logoFile) {
        return new ResponseEntity<>(ApiResponse.<BrandResponse>builder()
                .success(true)
                .code("BRAND_CREATED_SUCCESS")
                .message("Brand created successfully")
                .data(brandService.createBrand(request, logoFile)).build(), HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get all brands with filtering")
    @Parameters({
            @Parameter(name = "page", example = "1", schema = @Schema(type = "integer", defaultValue = "1")),
            @Parameter(name = "size", example = "20", schema = @Schema(type = "integer", defaultValue = "20")),
            @Parameter(name = "sort", example = "name,asc")
    })
    public ResponseEntity<PageResponse<BrandResponse>> getAllBrands(
            BrandFilterRequest filter,
            @Parameter(hidden = true) @PageableDefault(sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(brandService.getAllBrands(filter, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get brand by ID")
    public ResponseEntity<ApiResponse<BrandResponse>> getBrandById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.<BrandResponse>builder()
                .success(true)
                .code("BRAND_FETCHED_SUCCESS")
                .message("Brand fetched successfully")
                .data(brandService.getBrandById(id)).build());
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasAuthority('brand:update') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Update brand details (JSON)")
    public ResponseEntity<ApiResponse<BrandResponse>> updateBrandJson(
            @PathVariable String id, @Valid @RequestBody BrandRequest request) {
        return ResponseEntity.ok(ApiResponse.<BrandResponse>builder()
                .success(true)
                .code("BRAND_UPDATED_SUCCESS")
                .message("Brand updated successfully")
                .data(brandService.updateBrand(id, request, null)).build());
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('brand:update') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Update brand details (Multipart)")
    public ResponseEntity<ApiResponse<BrandResponse>> updateBrandMultipart(
            @PathVariable String id,
            @RequestPart("brand") @Valid BrandRequest request,
            @RequestPart(value = "logoFile", required = false) MultipartFile logoFile) {
        return ResponseEntity.ok(ApiResponse.<BrandResponse>builder()
                .success(true)
                .code("BRAND_UPDATED_SUCCESS")
                .message("Brand updated successfully")
                .data(brandService.updateBrand(id, request, logoFile)).build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('brand:delete') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Delete brand by ID")
    public ResponseEntity<ApiResponse<Void>> deleteBrand(@PathVariable String id) {
        brandService.deleteBrand(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .code("BRAND_DELETED_SUCCESS")
                .message("Brand deleted successfully").build());
    }
}
