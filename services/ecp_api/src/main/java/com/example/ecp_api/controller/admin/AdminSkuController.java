package com.example.ecp_api.controller.admin;

import com.example.ecp_api.dto.request.SkuFilterRequest;
import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.SkuAdminResponse;
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
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/skus")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('sku:read') or hasRole('SUPER_ADMIN')")
@Tag(name = "SKUs", description = "SKU Management APIs")
public class AdminSkuController {

    private final SkuService skuService;

    @GetMapping
    @Operation(summary = "Get all SKUs with full audit info")
    @Parameters({
            @Parameter(name = "page", example = "1", schema = @Schema(type = "integer", defaultValue = "1")),
            @Parameter(name = "size", example = "20", schema = @Schema(type = "integer", defaultValue = "20", maximum = "100")),
            @Parameter(name = "sort", example = "createdAt,desc")
    })
    public ResponseEntity<ApiResponse<PageResponse<SkuAdminResponse>>> getAllSkus(
            SkuFilterRequest filter,
            @Parameter(hidden = true) @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.<PageResponse<SkuAdminResponse>>builder()
                .success(true).message("SKUs fetched successfully").code("SKU_FETCHED")
                .data(skuService.getAllSkusAdmin(filter, pageable)).build());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get SKU by ID with full audit info")
    public ResponseEntity<ApiResponse<SkuAdminResponse>> getSkuDetails(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.<SkuAdminResponse>builder()
                .success(true).message("SKU fetched successfully").code("SKU_FETCHED")
                .data(skuService.getSkuByIdAdmin(id)).build());
    }
}
