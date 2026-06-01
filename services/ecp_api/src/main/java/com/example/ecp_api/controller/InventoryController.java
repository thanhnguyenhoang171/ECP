package com.example.ecp_api.controller;

import com.example.ecp_api.dto.request.InventoryAdjustmentRequest;
import com.example.ecp_api.dto.request.InventoryFilterRequest;
import com.example.ecp_api.dto.request.InventoryLedgerFilterRequest;
import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.dto.response.InventoryLedgerResponse;
import com.example.ecp_api.dto.response.InventoryResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.enums.common.TransactionType;
import com.example.ecp_api.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/inventory")
@RequiredArgsConstructor
@Tag(name = "Inventory Management", description = "APIs for tracking stock levels and transaction history")
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    @Operation(summary = "Get current inventory levels with filtering")
    public ResponseEntity<PageResponse<InventoryResponse>> getAll(
            @Valid InventoryFilterRequest filter,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(inventoryService.getAllInventory(filter, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    @Operation(summary = "Get inventory detail by ID")
    public ResponseEntity<ApiResponse<InventoryResponse>> getById(@PathVariable String id) {
        return ResponseEntity.ok(
                ApiResponse.<InventoryResponse>builder()
                        .success(true)
                        .data(inventoryService.getInventoryById(id))
                        .build()
        );
    }

    @PostMapping("/adjust")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Manual inventory adjustment (Admin only)")
    public ResponseEntity<ApiResponse<InventoryResponse>> adjust(@Valid @RequestBody InventoryAdjustmentRequest request) {
        InventoryResponse response = inventoryService.adjustInventory(
                request, TransactionType.STOCK_ADJUSTMENT, null, "MANUAL");
        return ResponseEntity.ok(
                ApiResponse.<InventoryResponse>builder()
                        .success(true)
                        .message("Inventory adjusted successfully")
                        .data(response)
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Delete inventory record (Only if stock is 0)")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        inventoryService.deleteInventory(id);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Inventory record deleted successfully")
                        .build()
        );
    }

    @GetMapping("/ledgers")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    @Operation(summary = "Get inventory ledgers with filtering")
    public ResponseEntity<PageResponse<InventoryLedgerResponse>> getLedgers(
            @Valid InventoryLedgerFilterRequest filter,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(inventoryService.getAllLedgers(filter, pageable));
    }

    @GetMapping("/ledgers/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    @Operation(summary = "Get inventory ledger detail by ID")
    public ResponseEntity<ApiResponse<InventoryLedgerResponse>> getLedgerDetail(@PathVariable String id) {
        return ResponseEntity.ok(
                ApiResponse.<InventoryLedgerResponse>builder()
                        .success(true)
                        .data(inventoryService.getLedgerById(id))
                        .build()
        );
    }

    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    @Operation(summary = "Get transaction history for a specific batch/SKU")
    public ResponseEntity<ApiResponse<List<InventoryLedgerResponse>>> getHistory(
            @RequestParam String warehouseId,
            @RequestParam String skuId,
            @RequestParam(required = false) String batchCode) {
        return ResponseEntity.ok(
                ApiResponse.<List<InventoryLedgerResponse>>builder()
                        .success(true)
                        .data(inventoryService.getHistory(warehouseId, skuId, batchCode))
                        .build()
        );
    }
}
