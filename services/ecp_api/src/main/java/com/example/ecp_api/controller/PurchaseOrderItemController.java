package com.example.ecp_api.controller;

import com.example.ecp_api.dto.request.PurchaseOrderItemFilterRequest;
import com.example.ecp_api.dto.request.PurchaseOrderItemRequest;
import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.PurchaseOrderItemAdminResponse;
import com.example.ecp_api.dto.response.PurchaseOrderItemResponse;
import com.example.ecp_api.service.PurchaseOrderItemService;
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

@RestController
@RequestMapping("/v1/purchase-order-items")
@RequiredArgsConstructor
@Tag(name = "Purchase Order Item Management", description = "APIs for managing individual items in a purchase order")
public class PurchaseOrderItemController {

    private final PurchaseOrderItemService purchaseOrderItemService;

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    @Operation(summary = "Add an item to a purchase order", description = "Adds a SKU with a specified price and quantity to an existing purchase order.")
    public ResponseEntity<ApiResponse<PurchaseOrderItemResponse>> createPurchaseOrderItem(@Valid @RequestBody PurchaseOrderItemRequest request) {
        PurchaseOrderItemResponse response = purchaseOrderItemService.createPurchaseOrderItem(request);
        return new ResponseEntity<>(
                ApiResponse.<PurchaseOrderItemResponse>builder()
                        .success(true)
                        .code("PURCHASE_ORDER_ITEM_CREATED")
                        .message("Purchase order item created successfully")
                        .data(response)
                        .build(),
                HttpStatus.CREATED
        );
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    @Operation(
            summary = "Get all purchase order items",
            description = "Retrieve paginated list of purchase order items. Managers use this; Admins can use /admin for full info."
    )
    @Parameters({
            @Parameter(name = "page", description = "Page number (1-indexed)", example = "1", schema = @Schema(type = "integer", defaultValue = "1")),
            @Parameter(name = "size", description = "Number of items per page (max 100)", example = "20", schema = @Schema(type = "integer", defaultValue = "20", maximum = "100")),
            @Parameter(name = "sort", description = "Sorting criteria (e.g. id,asc)", example = "id,asc")
    })
    public ResponseEntity<PageResponse<PurchaseOrderItemResponse>> getAllPurchaseOrderItems(
            @Valid PurchaseOrderItemFilterRequest filter,
            @Parameter(hidden = true) @PageableDefault(sort = "id", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(purchaseOrderItemService.getAllPurchaseOrderItems(filter, pageable));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(
            summary = "Get all purchase order items (Admin)",
            description = "Retrieve paginated list of purchase order items with full audit info. Super Admin access required."
    )
    @Parameters({
            @Parameter(name = "page", description = "Page number (1-indexed)", example = "1", schema = @Schema(type = "integer", defaultValue = "1")),
            @Parameter(name = "size", description = "Number of items per page (max 100)", example = "20", schema = @Schema(type = "integer", defaultValue = "20", maximum = "100")),
            @Parameter(name = "sort", description = "Sorting criteria (e.g. id,asc)", example = "id,asc")
    })
    public ResponseEntity<PageResponse<PurchaseOrderItemAdminResponse>> getAllPurchaseOrderItemsAdmin(
            @Valid PurchaseOrderItemFilterRequest filter,
            @Parameter(hidden = true) @PageableDefault(sort = "id", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(purchaseOrderItemService.getAllPurchaseOrderItemsAdmin(filter, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    @Operation(summary = "Get purchase order item by ID", description = "Retrieve detailed information for a specific purchase order item.")
    public ResponseEntity<ApiResponse<PurchaseOrderItemResponse>> getPurchaseOrderItem(
            @Parameter(description = "ID of the purchase order item to retrieve") @PathVariable String id) {
        return ResponseEntity.ok(
                ApiResponse.<PurchaseOrderItemResponse>builder()
                        .success(true)
                        .code("PURCHASE_ORDER_ITEM_FETCHED")
                        .message("Purchase order item fetched successfully")
                        .data(purchaseOrderItemService.getPurchaseOrderItemById(id))
                        .build()
        );
    }

    @GetMapping("/admin/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Get purchase order item by ID (Admin)", description = "Retrieve detailed information including audit info for a specific purchase order item.")
    public ResponseEntity<ApiResponse<PurchaseOrderItemAdminResponse>> getPurchaseOrderItemAdmin(
            @Parameter(description = "ID of the purchase order item to retrieve") @PathVariable String id) {
        return ResponseEntity.ok(
                ApiResponse.<PurchaseOrderItemAdminResponse>builder()
                        .success(true)
                        .code("PURCHASE_ORDER_ITEM_FETCHED")
                        .message("Purchase order item fetched successfully (Admin)")
                        .data(purchaseOrderItemService.getPurchaseOrderItemByIdAdmin(id))
                        .build()
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    @Operation(summary = "Update purchase order item", description = "Updates an existing purchase order item's details (e.g., price, quantities).")
    public ResponseEntity<ApiResponse<PurchaseOrderItemResponse>> updatePurchaseOrderItem(
            @Parameter(description = "ID of the purchase order item to update") @PathVariable String id,
            @Valid @RequestBody PurchaseOrderItemRequest request) {
        return ResponseEntity.ok(
                ApiResponse.<PurchaseOrderItemResponse>builder()
                        .success(true)
                        .code("PURCHASE_ORDER_ITEM_UPDATED")
                        .message("Purchase order item updated successfully")
                        .data(purchaseOrderItemService.updatePurchaseOrderItem(id, request))
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Delete purchase order item", description = "Permanently deletes an item from a purchase order. Super Admin access required.")
    public ResponseEntity<ApiResponse<Void>> deletePurchaseOrderItem(
            @Parameter(description = "ID of the purchase order item to delete") @PathVariable String id) {
        purchaseOrderItemService.deletePurchaseOrderItem(id);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .code("PURCHASE_ORDER_ITEM_DELETED")
                        .message("Purchase order item deleted successfully")
                        .build()
        );
    }
}
