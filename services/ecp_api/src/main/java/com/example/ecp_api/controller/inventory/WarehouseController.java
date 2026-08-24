package com.example.ecp_api.controller.inventory;

import com.example.ecp_api.dto.request.WarehouseFilterRequest;
import com.example.ecp_api.dto.request.WarehouseRequest;
import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.WarehouseResponse;
import com.example.ecp_api.service.WarehouseService;
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
@RequestMapping("/v1/warehouses")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('warehouse:read') or hasRole('SUPER_ADMIN')")
@Tag(name = "Warehouses", description = "Warehouse Management APIs")
public class WarehouseController {

    private final WarehouseService warehouseService;

    @GetMapping
    @Operation(summary = "Get all warehouses with filtering")
    public ResponseEntity<PageResponse<WarehouseResponse>> getAllWarehouses(
            WarehouseFilterRequest filter,
            Pageable pageable) {
        return ResponseEntity.ok(warehouseService.getAllWarehouses(filter, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get warehouse by ID")
    public ResponseEntity<ApiResponse<WarehouseResponse>> getWarehouseById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.<WarehouseResponse>builder()
                .success(true)
                .code("WAREHOUSE_FETCHED_SUCCESS")
                .message("Warehouse fetched successfully")
                .data(warehouseService.getWarehouseById(id)).build());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('warehouse:create') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Create a new warehouse")
    public ResponseEntity<ApiResponse<WarehouseResponse>> createWarehouse(@Valid @RequestBody WarehouseRequest request) {
        return new ResponseEntity<>(ApiResponse.<WarehouseResponse>builder()
                .success(true)
                .code("WAREHOUSE_CREATED_SUCCESS")
                .message("Warehouse created successfully")
                .data(warehouseService.createWarehouse(request)).build(), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('warehouse:update') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Update warehouse details")
    public ResponseEntity<ApiResponse<WarehouseResponse>> updateWarehouse(@PathVariable String id, @Valid @RequestBody WarehouseRequest request) {
        return ResponseEntity.ok(ApiResponse.<WarehouseResponse>builder()
                .success(true)
                .code("WAREHOUSE_UPDATED_SUCCESS")
                .message("Warehouse updated successfully")
                .data(warehouseService.updateWarehouse(id, request)).build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('warehouse:delete') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Delete warehouse")
    public ResponseEntity<ApiResponse<Void>> deleteWarehouse(@PathVariable String id) {
        warehouseService.deleteWarehouse(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .code("WAREHOUSE_DELETED_SUCCESS")
                .message("Warehouse deleted successfully").build());
    }
}
