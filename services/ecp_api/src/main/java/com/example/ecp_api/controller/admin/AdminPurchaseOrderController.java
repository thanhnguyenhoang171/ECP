package com.example.ecp_api.controller.admin;

import com.example.ecp_api.dto.request.PurchaseOrderFilterRequest;
import com.example.ecp_api.dto.request.PurchaseOrderRequest;
import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.PurchaseOrderAdminResponse;
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
@RequestMapping("/v1/admin/purchase-orders")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('purchase_order:read') or hasRole('SUPER_ADMIN')")
@Tag(name = "[ADMIN] Purchase Order Management", description = "Management API: Purchase Order PO management")
public class AdminPurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    @PostMapping
    @Operation(summary = "Create a new purchase order")
    public ResponseEntity<ApiResponse<PurchaseOrderAdminResponse>> createPurchaseOrder(@Valid @RequestBody PurchaseOrderRequest request) {
        return new ResponseEntity<>(ApiResponse.<PurchaseOrderAdminResponse>builder()
                .success(true).code("PURCHASE_ORDER_CREATED").message("Purchase order created successfully")
                .data(purchaseOrderService.createPurchaseOrderAdmin(request)).build(), HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get all purchase orders with full audit info")
    @Parameters({
            @Parameter(name = "page", example = "1", schema = @Schema(type = "integer", defaultValue = "1")),
            @Parameter(name = "size", example = "20", schema = @Schema(type = "integer", defaultValue = "20")),
            @Parameter(name = "sort", example = "createdAt,desc")
    })
    public ResponseEntity<PageResponse<PurchaseOrderAdminResponse>> getAllPurchaseOrders(
            @Valid PurchaseOrderFilterRequest filter,
            @Parameter(hidden = true) @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(purchaseOrderService.getAllPurchaseOrdersAdmin(filter, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get purchase order by ID with full audit info")
    public ResponseEntity<ApiResponse<PurchaseOrderAdminResponse>> getPurchaseOrder(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.<PurchaseOrderAdminResponse>builder()
                .success(true).code("PURCHASE_ORDER_FETCHED").message("Purchase order fetched successfully")
                .data(purchaseOrderService.getPurchaseOrderByIdAdmin(id)).build());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update purchase order")
    public ResponseEntity<ApiResponse<PurchaseOrderAdminResponse>> updatePurchaseOrder(
            @PathVariable String id, @Valid @RequestBody PurchaseOrderRequest request) {
        return ResponseEntity.ok(ApiResponse.<PurchaseOrderAdminResponse>builder()
                .success(true).code("PURCHASE_ORDER_UPDATED").message("Purchase order updated successfully")
                .data(purchaseOrderService.updatePurchaseOrderAdmin(id, request)).build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete purchase order")
    public ResponseEntity<ApiResponse<Void>> deletePurchaseOrder(@PathVariable String id) {
        purchaseOrderService.deletePurchaseOrder(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true).code("PURCHASE_ORDER_DELETED").message("Purchase order deleted successfully").build());
    }
}
