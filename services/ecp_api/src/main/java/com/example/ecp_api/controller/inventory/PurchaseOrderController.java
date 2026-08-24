package com.example.ecp_api.controller.inventory;

import com.example.ecp_api.dto.request.PurchaseOrderFilterRequest;
import com.example.ecp_api.dto.request.PurchaseOrderRequest;
import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.PurchaseOrderResponse;
import com.example.ecp_api.service.PurchaseOrderService;
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
@RequestMapping("/v1/purchase-orders")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('purchase_order:read') or hasRole('SUPER_ADMIN')")
@Tag(name = "Purchase Orders", description = "Purchase Order Management APIs")
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    @PostMapping
    @PreAuthorize("hasAuthority('purchase_order:create') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Create a new Purchase Order (PO)")
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> createPO(@Valid @RequestBody PurchaseOrderRequest request) {
        return new ResponseEntity<>(ApiResponse.<PurchaseOrderResponse>builder()
                .success(true)
                .code("PURCHASE_ORDER_CREATED_SUCCESS")
                .message("Purchase order created successfully")
                .data(purchaseOrderService.createPurchaseOrder(request)).build(), HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Query purchase orders with filtering")
    public ResponseEntity<PageResponse<PurchaseOrderResponse>> getAllPOs(
            PurchaseOrderFilterRequest request, Pageable pageable) {
        return ResponseEntity.ok(purchaseOrderService.getAllPurchaseOrders(request, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Purchase Order by ID")
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> getPOById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.<PurchaseOrderResponse>builder()
                .success(true)
                .code("PURCHASE_ORDER_FETCHED_SUCCESS")
                .message("Purchase order fetched successfully")
                .data(purchaseOrderService.getPurchaseOrderById(id)).build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('purchase_order:update') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Update a Purchase Order")
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> updatePO(
            @PathVariable String id,
            @Valid @RequestBody PurchaseOrderRequest request) {
        return ResponseEntity.ok(ApiResponse.<PurchaseOrderResponse>builder()
                .success(true)
                .code("PURCHASE_ORDER_UPDATED_SUCCESS")
                .message("Purchase order updated successfully")
                .data(purchaseOrderService.updatePurchaseOrder(id, request)).build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('purchase_order:delete') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Delete Purchase Order by ID")
    public ResponseEntity<ApiResponse<Void>> deletePO(@PathVariable String id) {
        purchaseOrderService.deletePurchaseOrder(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .code("PURCHASE_ORDER_DELETED_SUCCESS")
                .message("Purchase order deleted successfully").build());
    }
}
