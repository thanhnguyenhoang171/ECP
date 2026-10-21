package com.example.ecp_api.controller.inventory;

import com.example.ecp_api.dto.request.InventoryFilterRequest;
import com.example.ecp_api.dto.request.InventoryLedgerFilterRequest;
import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.dto.response.InventoryLedgerResponse;
import com.example.ecp_api.dto.response.InventoryResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/v1/inventory")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('inventory:read') or hasRole('SUPER_ADMIN')")
@Tag(name = "Inventory", description = "Inventory Management APIs: Stock balances and ledgers")
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/stocks")
    @Operation(summary = "Query inventory stock levels across warehouses")
    public ResponseEntity<PageResponse<InventoryResponse>> getStockLevels(
            @jakarta.validation.Valid @org.springdoc.core.annotations.ParameterObject InventoryFilterRequest request,
            @org.springdoc.core.annotations.ParameterObject @PageableDefault(sort = "updatedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(inventoryService.getAllInventory(request, pageable));
    }

    @GetMapping("/stocks/export")
    @PreAuthorize("hasAuthority('inventory:export') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Export all matching stock rows to an Excel reconciliation workbook")
    public ResponseEntity<byte[]> exportStocks(
            @jakarta.validation.Valid @org.springdoc.core.annotations.ParameterObject InventoryFilterRequest filter,
            @RequestParam(defaultValue = "sku,asc") String sort) {
        byte[] file = inventoryService.exportInventory(filter, sort);
        String timestamp = java.time.LocalDateTime.now(java.time.ZoneId.of("Asia/Bangkok"))
                .format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"ton-kho_" + timestamp + ".xlsx\"")
                .header(org.springframework.http.HttpHeaders.CACHE_CONTROL, "no-store")
                .body(file);
    }

    @GetMapping("/ledgers")
    @Operation(summary = "Query inventory audit ledgers (stock movements)")
    public ResponseEntity<PageResponse<InventoryLedgerResponse>> getLedgerEntries(
            @org.springdoc.core.annotations.ParameterObject InventoryLedgerFilterRequest request,
            @org.springdoc.core.annotations.ParameterObject @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(inventoryService.getAllLedgers(request, pageable));
    }

    @GetMapping("/stocks/{id}")
    @Operation(summary = "Get inventory item details by ID")
    public ResponseEntity<ApiResponse<InventoryResponse>> getInventoryById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.<InventoryResponse>builder()
                .success(true)
                .code("INVENTORY_FETCHED_SUCCESS")
                .message("Inventory item fetched successfully")
                .data(inventoryService.getInventoryById(id)).build());
    }
    @PostMapping("/adjust")
    @PreAuthorize("hasAuthority('inventory:manage') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<InventoryResponse>> adjustStock(
            @jakarta.validation.Valid @RequestBody com.example.ecp_api.dto.request.InventoryAdjustmentRequest request) {
        return ResponseEntity.ok(ApiResponse.<InventoryResponse>builder().success(true)
                .data(inventoryService.adjustInventory(request, com.example.ecp_api.enums.common.TransactionType.STOCK_ADJUSTMENT,
                        null, "MANUAL")).build());
    }

    @GetMapping("/ledgers/{id}")
    public ResponseEntity<ApiResponse<InventoryLedgerResponse>> getLedger(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.<InventoryLedgerResponse>builder().success(true)
                .data(inventoryService.getLedgerById(id)).build());
    }

}
