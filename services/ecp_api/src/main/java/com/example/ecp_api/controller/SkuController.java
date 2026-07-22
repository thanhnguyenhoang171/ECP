package com.example.ecp_api.controller;

import com.example.ecp_api.dto.request.SkuFilterRequest;
import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.SkuResponse;
import com.example.ecp_api.service.SkuService;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/skus")
@RequiredArgsConstructor
@Tag(name = "SKU Management", description = "APIs for managing individual Stock Keeping Units (Variants)")
public class SkuController {

    private final SkuService skuService;
    // Get sku list
    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    @Operation(
            summary = "Get all SKUs",
            description = "Retrieve paginated list of SKUs with advanced filtering. Supports filtering by SKU code, product ID, product name, and active status. Admin/Manager access required."
    )
    @Parameters({
            @Parameter(name = "page", description = "Page number (1-indexed)", example = "1", schema = @Schema(type = "integer", defaultValue = "1")),
            @Parameter(name = "size", description = "Number of items per page (max 100)", example = "20", schema = @Schema(type = "integer", defaultValue = "20", maximum = "100")),
            @Parameter(name = "sort", description = "Sorting criteria (e.g. skuCode,asc)", example = "createdAt,desc")
    })
    public ResponseEntity<ApiResponse<PageResponse<SkuResponse>>> getAllSkus(
            SkuFilterRequest filter,
            @Parameter(hidden = true) @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(
                ApiResponse.<PageResponse<SkuResponse>>builder()
                        .success(true)
                        .message("SKUs fetched successfully")
                        .code("SKU_FETCHED")
                        .data(skuService.getAllSkus(filter, pageable))
                        .build()
        );
    }

    // Get sku detail
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    @Operation(
            summary = "Get SKU Detail",
            description = "Retrieve SKU details. Administrator/manager access required."
    )
    public ResponseEntity<ApiResponse<SkuResponse>> getSkuDetails(
            @Parameter(description = "ID of the SKU to retrieve") @PathVariable String id) {
        return ResponseEntity.ok(
                ApiResponse.<SkuResponse>builder()
                        .success(true)
                        .message("SKU fetched successfully")
                        .code("SKU_FETCHED")
                        .data(skuService.getSkuById(id))
                        .build()
        );
    }
}
