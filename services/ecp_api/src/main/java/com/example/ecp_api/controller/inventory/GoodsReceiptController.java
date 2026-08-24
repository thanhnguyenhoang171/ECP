package com.example.ecp_api.controller.inventory;

import com.example.ecp_api.dto.request.GoodsReceiptFilterRequest;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/goods-receipts")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('goods_receipt:read') or hasRole('SUPER_ADMIN')")
@Tag(name = "Goods Receipts", description = "Goods Receipt Management APIs")
public class GoodsReceiptController {

    private final GoodsReceiptService goodsReceiptService;

    @PostMapping
    @PreAuthorize("hasAuthority('goods_receipt:create') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Create a Goods Receipt (GR) and automatically update physical warehouse inventory balances")
    public ResponseEntity<ApiResponse<GoodsReceiptResponse>> createGoodsReceipt(@Valid @RequestBody GoodsReceiptRequest request) {
        return new ResponseEntity<>(ApiResponse.<GoodsReceiptResponse>builder()
                .success(true)
                .code("GOODS_RECEIPT_CREATED_SUCCESS")
                .message("Goods receipt created successfully")
                .data(goodsReceiptService.createGoodsReceipt(request)).build(), HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Query Goods Receipts with filtering")
    public ResponseEntity<PageResponse<GoodsReceiptResponse>> getAllGoodsReceipts(
            GoodsReceiptFilterRequest request, Pageable pageable) {
        return ResponseEntity.ok(goodsReceiptService.getAllGoodsReceipts(request, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Goods Receipt details by ID")
    public ResponseEntity<ApiResponse<GoodsReceiptResponse>> getGoodsReceiptById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.<GoodsReceiptResponse>builder()
                .success(true)
                .code("GOODS_RECEIPT_FETCHED_SUCCESS")
                .message("Goods receipt fetched successfully")
                .data(goodsReceiptService.getGoodsReceiptById(id)).build());
    }
}
