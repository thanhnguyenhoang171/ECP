package com.example.ecp_api.controller.manager;

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
@RequestMapping("/v1/manager/goods-receipts")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('MANAGER', 'SUPER_ADMIN')")
@Tag(name = "[MANAGER] Goods Receipt Management", description = "Manager: CRUD on goods receipts. Response excludes audit fields (createdBy, updatedBy).")
public class ManagerGoodsReceiptController {

    private final GoodsReceiptService goodsReceiptService;

    @PostMapping
    @Operation(summary = "Create a new goods receipt")
    public ResponseEntity<ApiResponse<GoodsReceiptResponse>> create(@Valid @RequestBody GoodsReceiptRequest request) {
        return new ResponseEntity<>(ApiResponse.<GoodsReceiptResponse>builder()
                .success(true).code("RECEIPT_CREATED").message("Goods receipt created successfully")
                .data(goodsReceiptService.createGoodsReceipt(request)).build(), HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get all goods receipts")
    public ResponseEntity<PageResponse<GoodsReceiptResponse>> getAll(
            @Valid com.example.ecp_api.dto.request.GoodsReceiptFilterRequest filter,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(goodsReceiptService.getAllGoodsReceipts(filter, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get goods receipt by ID")
    public ResponseEntity<ApiResponse<GoodsReceiptResponse>> getById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.<GoodsReceiptResponse>builder()
                .success(true).data(goodsReceiptService.getGoodsReceiptById(id)).build());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update goods receipt (DRAFT status only)")
    public ResponseEntity<ApiResponse<GoodsReceiptResponse>> update(
            @PathVariable String id, @Valid @RequestBody GoodsReceiptRequest request) {
        return ResponseEntity.ok(ApiResponse.<GoodsReceiptResponse>builder()
                .success(true).message("Goods receipt updated successfully")
                .data(goodsReceiptService.updateGoodsReceipt(id, request)).build());
    }

    @PatchMapping("/{id}/confirm")
    @Operation(summary = "Confirm goods receipt (mark as RECEIVED, triggers inventory update)")
    public ResponseEntity<ApiResponse<GoodsReceiptResponse>> confirm(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.<GoodsReceiptResponse>builder()
                .success(true).message("Goods receipt confirmed successfully")
                .data(goodsReceiptService.confirmReceipt(id)).build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete goods receipt (DRAFT status only)")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        goodsReceiptService.deleteGoodsReceipt(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true).message("Goods receipt deleted successfully").build());
    }
}
