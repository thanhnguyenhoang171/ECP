package com.example.ecp_api.controller.inventory;

import com.example.ecp_api.dto.request.InventoryFilterRequest;
import com.example.ecp_api.dto.request.InventoryLedgerFilterRequest;
import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.dto.response.InventoryLedgerResponse;
import com.example.ecp_api.dto.response.InventoryResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
            InventoryFilterRequest request,
            @Parameter(hidden = true) @PageableDefault(sort = "updatedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(inventoryService.getAllInventory(request, pageable));
    }

    @GetMapping("/ledgers")
    @Operation(summary = "Query inventory audit ledgers (stock movements)")
    public ResponseEntity<PageResponse<InventoryLedgerResponse>> getLedgerEntries(
            InventoryLedgerFilterRequest request,
            @Parameter(hidden = true) @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
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
}
