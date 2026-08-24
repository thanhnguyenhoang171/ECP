package com.example.ecp_api.controller.admin;

import com.example.ecp_api.dto.request.GoodsReceiptRequest;
import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.dto.response.GoodsReceiptAdminResponse;
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
@RequestMapping("/v1/admin/goods-receipts")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('goods_receipt:read') or hasRole('SUPER_ADMIN')")
@Tag(name = "[ADMIN] Goods Receipt Management", description = "Management API: Goods Receipt GR management")
public class AdminGoodsReceiptController {

    private final GoodsReceiptService goodsReceiptService;

    @PostMapping
    @Operation(summary = "Create a new goods receipt")
    public ResponseEntity<ApiResponse<GoodsReceiptAdminResponse>> create(@Valid @RequestBody GoodsReceiptRequest request) {
        return new ResponseEntity<>(ApiResponse.<GoodsReceiptAdminResponse>builder()
                .success(true).code("RECEIPT_CREATED").message("Goods receipt created successfully")
                .data(goodsReceiptService.createGoodsReceiptAdmin(request)).build(), HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get all goods receipts with full audit info")
    public ResponseEntity<PageResponse<GoodsReceiptAdminResponse>> getAll(
            @Valid com.example.ecp_api.dto.request.GoodsReceiptFilterRequest filter,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(goodsReceiptService.getAllGoodsReceiptsAdmin(filter, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get goods receipt by ID with full audit info")
    public ResponseEntity<ApiResponse<GoodsReceiptAdminResponse>> getById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.<GoodsReceiptAdminResponse>builder()
                .success(true).data(goodsReceiptService.getGoodsReceiptByIdAdmin(id)).build());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update goods receipt")
    public ResponseEntity<ApiResponse<GoodsReceiptAdminResponse>> update(
            @PathVariable String id, @Valid @RequestBody GoodsReceiptRequest request) {
        return ResponseEntity.ok(ApiResponse.<GoodsReceiptAdminResponse>builder()
                .success(true).message("Goods receipt updated successfully")
                .data(goodsReceiptService.updateGoodsReceiptAdmin(id, request)).build());
    }

    @PatchMapping("/{id}/confirm")
    @Operation(summary = "Confirm goods receipt (Mark as RECEIVED)")
    public ResponseEntity<ApiResponse<GoodsReceiptAdminResponse>> confirm(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.<GoodsReceiptAdminResponse>builder()
                .success(true).message("Goods receipt confirmed successfully")
                .data(goodsReceiptService.confirmReceiptAdmin(id)).build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete goods receipt")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        goodsReceiptService.deleteGoodsReceipt(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true).message("Goods receipt deleted successfully").build());
    }
}
