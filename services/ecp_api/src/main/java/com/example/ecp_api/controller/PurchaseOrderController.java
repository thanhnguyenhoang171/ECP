package com.example.ecp_api.controller;

import com.example.ecp_api.dto.request.PurchaseOrderFilterRequest;
import com.example.ecp_api.dto.request.PurchaseOrderRequest;
import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.PurchaseOrderAdminResponse;
import com.example.ecp_api.dto.response.PurchaseOrderResponse;
import com.example.ecp_api.service.PurchaseOrderService;
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
@RequestMapping("/v1/purchase-orders")
@RequiredArgsConstructor
@Tag(name = "Purchase Order Management", description = "APIs for managing warehouse purchase orders")
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    @Operation(summary = "Create a new purchase order", description = "Creates a new warehouse purchase order. Admin/Manager access required.")
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> createPurchaseOrder(@Valid @RequestBody PurchaseOrderRequest request) {
        PurchaseOrderResponse response = purchaseOrderService.createPurchaseOrder(request);
        return new ResponseEntity<>(
                ApiResponse.<PurchaseOrderResponse>builder()
                        .success(true)
                        .code("PURCHASE_ORDER_CREATED")
                        .message("Purchase order created successfully")
                        .data(response)
                        .build(),
                HttpStatus.CREATED
        );
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    @Operation(
            summary = "Get all purchase orders",
            description = "Retrieve paginated list of purchase orders. Audit info (createdBy, updatedBy) is hidden. Managers use this; Admins can use /admin for full info."
    )
    @Parameters({
            @Parameter(name = "page", description = "Page number (1-indexed)", example = "1", schema = @Schema(type = "integer", defaultValue = "1")),
            @Parameter(name = "size", description = "Number of items per page (max 100)", example = "20", schema = @Schema(type = "integer", defaultValue = "20", maximum = "100")),
            @Parameter(name = "sort", description = "Sorting criteria (e.g. poCode,asc)", example = "createdAt,desc")
    })
    public ResponseEntity<PageResponse<PurchaseOrderResponse>> getAllPurchaseOrders(
            @Valid PurchaseOrderFilterRequest filter,
            @Parameter(hidden = true) @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(purchaseOrderService.getAllPurchaseOrders(filter, pageable));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(
            summary = "Get all purchase orders (Admin)",
            description = "Retrieve paginated list of purchase orders with full audit info. Super Admin access required."
    )
    @Parameters({
            @Parameter(name = "page", description = "Page number (1-indexed)", example = "1", schema = @Schema(type = "integer", defaultValue = "1")),
            @Parameter(name = "size", description = "Number of items per page (max 100)", example = "20", schema = @Schema(type = "integer", defaultValue = "20", maximum = "100")),
            @Parameter(name = "sort", description = "Sorting criteria (e.g. poCode,asc)", example = "createdAt,desc")
    })
    public ResponseEntity<PageResponse<PurchaseOrderAdminResponse>> getAllPurchaseOrdersAdmin(
            @Valid PurchaseOrderFilterRequest filter,
            @Parameter(hidden = true) @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(purchaseOrderService.getAllPurchaseOrdersAdmin(filter, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    @Operation(summary = "Get purchase order by ID", description = "Retrieve detailed information for a specific purchase order.")
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> getPurchaseOrder(
            @Parameter(description = "ID of the purchase order to retrieve") @PathVariable String id) {
        return ResponseEntity.ok(
                ApiResponse.<PurchaseOrderResponse>builder()
                        .success(true)
                        .code("PURCHASE_ORDER_FETCHED")
                        .message("Purchase order fetched successfully")
                        .data(purchaseOrderService.getPurchaseOrderById(id))
                        .build()
        );
    }

    @GetMapping("/admin/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Get purchase order by ID (Admin)", description = "Retrieve detailed information including audit info for a specific purchase order.")
    public ResponseEntity<ApiResponse<PurchaseOrderAdminResponse>> getPurchaseOrderAdmin(
            @Parameter(description = "ID of the purchase order to retrieve") @PathVariable String id) {
        return ResponseEntity.ok(
                ApiResponse.<PurchaseOrderAdminResponse>builder()
                        .success(true)
                        .code("PURCHASE_ORDER_FETCHED")
                        .message("Purchase order fetched successfully (Admin)")
                        .data(purchaseOrderService.getPurchaseOrderByIdAdmin(id))
                        .build()
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    @Operation(summary = "Update purchase order", description = "Updates an existing purchase order's details.")
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> updatePurchaseOrder(
            @Parameter(description = "ID of the purchase order to update") @PathVariable String id,
            @Valid @RequestBody PurchaseOrderRequest request) {
        return ResponseEntity.ok(
                ApiResponse.<PurchaseOrderResponse>builder()
                        .success(true)
                        .code("PURCHASE_ORDER_UPDATED")
                        .message("Purchase order updated successfully")
                        .data(purchaseOrderService.updatePurchaseOrder(id, request))
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Delete purchase order", description = "Permanently deletes a purchase order from the system. Super Admin access required.")
    public ResponseEntity<ApiResponse<Void>> deletePurchaseOrder(
            @Parameter(description = "ID of the purchase order to delete") @PathVariable String id) {
        purchaseOrderService.deletePurchaseOrder(id);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .code("PURCHASE_ORDER_DELETED")
                        .message("Purchase order deleted successfully")
                        .build()
        );
    }
}
