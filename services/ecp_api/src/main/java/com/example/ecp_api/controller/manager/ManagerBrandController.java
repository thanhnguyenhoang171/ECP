package com.example.ecp_api.controller.manager;

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

import java.util.List;

@RestController
@RequestMapping("/v1/manager/brands")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('MANAGER', 'SUPER_ADMIN')")
@Tag(name = "[MANAGER] Brand Management", description = "Manager: CRUD on brands. Response excludes audit fields (createdBy, updatedBy).")
public class ManagerBrandController {

    private final BrandService brandService;

    @PostMapping
    @Operation(summary = "Create a new brand")
    public ResponseEntity<ApiResponse<BrandResponse>> createBrand(@Valid @RequestBody BrandRequest request) {
        return new ResponseEntity<>(ApiResponse.<BrandResponse>builder()
                .success(true).message("Brand created successfully")
                .data(brandService.createBrand(request)).build(), HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get all brands with pagination and filtering")
    @Parameters({
            @Parameter(name = "page", example = "1", schema = @Schema(type = "integer", defaultValue = "1")),
            @Parameter(name = "size", example = "20", schema = @Schema(type = "integer", defaultValue = "20")),
            @Parameter(name = "sort", example = "createdAt,desc")
    })
    public ResponseEntity<PageResponse<BrandResponse>> getAllBrands(
            BrandFilterRequest filter,
            @Parameter(hidden = true) @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(brandService.getAllBrands(filter, pageable));
    }

    @GetMapping("/active")
    @Operation(summary = "Get all active brands")
    public ResponseEntity<ApiResponse<List<BrandResponse>>> getActiveBrands() {
        return ResponseEntity.ok(ApiResponse.<List<BrandResponse>>builder()
                .success(true).message("Active brands fetched successfully")
                .data(brandService.getActiveBrands()).build());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get brand by ID")
    public ResponseEntity<ApiResponse<BrandResponse>> getBrandById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.<BrandResponse>builder()
                .success(true).message("Brand fetched successfully")
                .data(brandService.getBrandById(id)).build());
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Update a brand")
    public ResponseEntity<ApiResponse<BrandResponse>> updateBrand(
            @PathVariable String id, @RequestBody BrandRequest request) {
        return ResponseEntity.ok(ApiResponse.<BrandResponse>builder()
                .success(true).message("Brand updated successfully")
                .data(brandService.updateBrand(id, request)).build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a brand")
    public ResponseEntity<ApiResponse<Void>> deleteBrand(@PathVariable String id) {
        brandService.deleteBrand(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true).message("Brand deleted successfully").build());
    }
}
