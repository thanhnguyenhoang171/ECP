package com.example.ecp_api.controller.storefront;

import com.example.ecp_api.dto.request.BrandFilterRequest;
import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.dto.response.BrandResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.service.BrandService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/storefront/brands")
@RequiredArgsConstructor
@Tag(name = "[STOREFRONT] Brand", description = "Public Storefront API for viewing brands")
public class StorefrontBrandController {

    private final BrandService brandService;

    @GetMapping
    @Operation(summary = "Get all brands for storefront catalog")
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
    @Operation(summary = "Get active brands for storefront")
    public ResponseEntity<ApiResponse<List<BrandResponse>>> getActiveBrands() {
        return ResponseEntity.ok(ApiResponse.<List<BrandResponse>>builder()
                .success(true).message("Active brands fetched successfully")
                .data(brandService.getActiveBrands()).build());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get brand details by ID")
    public ResponseEntity<ApiResponse<BrandResponse>> getBrandById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.<BrandResponse>builder()
                .success(true).message("Brand fetched successfully")
                .data(brandService.getBrandById(id)).build());
    }
}
