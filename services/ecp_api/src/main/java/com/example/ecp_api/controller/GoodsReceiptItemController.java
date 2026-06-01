package com.example.ecp_api.controller;

import com.example.ecp_api.dto.request.GoodsReceiptItemRequest;
import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.dto.response.GoodsReceiptItemResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.service.GoodsReceiptItemService;
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

import java.util.List;

@RestController
@RequestMapping("/v1/goods-receipt-items")
@RequiredArgsConstructor
@Tag(name = "Goods Receipt Item Management", description = "APIs for managing individual items within a goods receipt")
public class GoodsReceiptItemController {

    private final GoodsReceiptItemService goodsReceiptItemService;

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    @Operation(summary = "Add an item to a goods receipt")
    public ResponseEntity<ApiResponse<GoodsReceiptItemResponse>> create(@Valid @RequestBody GoodsReceiptItemRequest request) {
        return new ResponseEntity<>(
                ApiResponse.<GoodsReceiptItemResponse>builder()
                        .success(true)
                        .message("Item added to goods receipt successfully")
                        .data(goodsReceiptItemService.addItemToReceipt(request))
                        .build(),
                HttpStatus.CREATED
        );
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    @Operation(summary = "Add multiple items to a goods receipt", description = "Receives a JSON array of items and saves them using a loop.")
    public ResponseEntity<ApiResponse<List<GoodsReceiptItemResponse>>> createBulk(@Valid @RequestBody List<GoodsReceiptItemRequest> requests) {
        return new ResponseEntity<>(
                ApiResponse.<List<GoodsReceiptItemResponse>>builder()
                        .success(true)
                        .message("Items added to goods receipt successfully")
                        .data(goodsReceiptItemService.addItemsToReceipt(requests))
                        .build(),
                HttpStatus.CREATED
        );
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    @Operation(summary = "Get all items (paginated with filter)")
    public ResponseEntity<PageResponse<GoodsReceiptItemResponse>> getAll(
            @Valid com.example.ecp_api.dto.request.GoodsReceiptItemFilterRequest filter,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(goodsReceiptItemService.getAllItems(filter, pageable));
    }

    @GetMapping("/receipt/{receiptId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    @Operation(summary = "Get all items for a specific goods receipt")
    public ResponseEntity<ApiResponse<List<GoodsReceiptItemResponse>>> getByReceiptId(@PathVariable String receiptId) {
        return ResponseEntity.ok(
                ApiResponse.<List<GoodsReceiptItemResponse>>builder()
                        .success(true)
                        .data(goodsReceiptItemService.getItemsByReceiptId(receiptId))
                        .build()
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    @Operation(summary = "Get item details by ID")
    public ResponseEntity<ApiResponse<GoodsReceiptItemResponse>> getById(@PathVariable String id) {
        return ResponseEntity.ok(
                ApiResponse.<GoodsReceiptItemResponse>builder()
                        .success(true)
                        .data(goodsReceiptItemService.getItemById(id))
                        .build()
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    @Operation(summary = "Update item details")
    public ResponseEntity<ApiResponse<GoodsReceiptItemResponse>> update(@PathVariable String id, @Valid @RequestBody GoodsReceiptItemRequest request) {
        return ResponseEntity.ok(
                ApiResponse.<GoodsReceiptItemResponse>builder()
                        .success(true)
                        .message("Item updated successfully")
                        .data(goodsReceiptItemService.updateItem(id, request))
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    @Operation(summary = "Remove item from goods receipt")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        goodsReceiptItemService.deleteItem(id);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Item removed successfully")
                        .build()
        );
    }
}
