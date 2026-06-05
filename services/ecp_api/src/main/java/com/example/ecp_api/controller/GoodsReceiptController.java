package com.example.ecp_api.controller;

import com.example.ecp_api.dto.request.GoodsReceiptRequest;
import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.dto.response.GoodsReceiptResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.service.GoodsReceiptService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/goods-receipts")
@RequiredArgsConstructor
@Tag(name = "Goods Receipt Management", description = "APIs for managing warehouse goods receipts")
public class GoodsReceiptController {

    private final GoodsReceiptService goodsReceiptService;

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    @Operation(summary = "Create a new goods receipt")
    public ResponseEntity<ApiResponse<GoodsReceiptResponse>> create(@Valid @RequestBody GoodsReceiptRequest request) {
        return new ResponseEntity<>(
                ApiResponse.<GoodsReceiptResponse>builder()
                        .success(true)
                        .code("RECEIPT_CREATED")
                        .message("Goods receipt created successfully")
                        .data(goodsReceiptService.createGoodsReceipt(request))
                        .build(),
                HttpStatus.CREATED
        );
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    @Operation(summary = "Get all goods receipts (paginated with filter)")
    public ResponseEntity<PageResponse<GoodsReceiptResponse>> getAll(
            @Valid com.example.ecp_api.dto.request.GoodsReceiptFilterRequest filter,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(goodsReceiptService.getAllGoodsReceipts(filter, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    @Operation(summary = "Get goods receipt by ID")
    public ResponseEntity<ApiResponse<GoodsReceiptResponse>> getById(@PathVariable String id) {
        return ResponseEntity.ok(
                ApiResponse.<GoodsReceiptResponse>builder()
                        .success(true)
                        .data(goodsReceiptService.getGoodsReceiptById(id))
                        .build()
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    @Operation(summary = "Update goods receipt")
    public ResponseEntity<ApiResponse<GoodsReceiptResponse>> update(@PathVariable String id, @Valid @RequestBody GoodsReceiptRequest request) {
        return ResponseEntity.ok(
                ApiResponse.<GoodsReceiptResponse>builder()
                        .success(true)
                        .message("Goods receipt updated successfully")
                        .data(goodsReceiptService.updateGoodsReceipt(id, request))
                        .build()
        );
    }

    @PatchMapping("/{id}/confirm")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    @Operation(summary = "Confirm goods receipt (Mark as RECEIVED)")
    public ResponseEntity<ApiResponse<GoodsReceiptResponse>> confirm(@PathVariable String id) {
        return ResponseEntity.ok(
                ApiResponse.<GoodsReceiptResponse>builder()
                        .success(true)
                        .message("Goods receipt confirmed successfully")
                        .data(goodsReceiptService.confirmReceipt(id))
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Delete goods receipt")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        goodsReceiptService.deleteGoodsReceipt(id);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Goods receipt deleted successfully")
                        .build()
        );
    }
}
