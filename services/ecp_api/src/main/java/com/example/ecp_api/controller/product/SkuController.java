package com.example.ecp_api.controller.product;

import com.example.ecp_api.dto.request.SkuFilterRequest;
import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.SkuResponse;
import com.example.ecp_api.service.SkuService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/skus")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('sku:read') or hasRole('SUPER_ADMIN')")
@Tag(name = "SKUs", description = "SKU Management APIs")
public class SkuController {

    private final SkuService skuService;

    @GetMapping
    @Operation(summary = "Get all SKUs with filtering")
    public ResponseEntity<PageResponse<SkuResponse>> getAllSkus(
            SkuFilterRequest filter,
            Pageable pageable) {
        return ResponseEntity.ok(skuService.getAllSkus(filter, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get SKU details by ID")
    public ResponseEntity<ApiResponse<SkuResponse>> getSkuById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.<SkuResponse>builder()
                .success(true)
                .code("SKU_FETCHED_SUCCESS")
                .message("SKU fetched successfully")
                .data(skuService.getSkuById(id)).build());
    }
}
