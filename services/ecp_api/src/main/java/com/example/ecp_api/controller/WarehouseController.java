package com.example.ecp_api.controller;

import com.example.ecp_api.dto.request.WarehouseFilterRequest;
import com.example.ecp_api.dto.request.WarehouseRequest;
import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.WarehouseResponse;
import com.example.ecp_api.service.WarehouseService;
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
@RequestMapping("/v1/warehouses")
@RequiredArgsConstructor
@Tag(name = "Warehouse Management", description = "APIs for managing physical storage locations")
public class WarehouseController {

    private final WarehouseService warehouseService;

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    @Operation(summary = "Create a new warehouse", description = "Admin/Manager access required. Creates a new physical storage location.")
    public ResponseEntity<ApiResponse<WarehouseResponse>> createWarehouse(@Valid @RequestBody WarehouseRequest request) {
        WarehouseResponse response = warehouseService.createWarehouse(request);
        return new ResponseEntity<>(
                ApiResponse.<WarehouseResponse>builder()
                        .success(true)
                        .message("Warehouse created successfully")
                        .data(response)
                        .build(),
                HttpStatus.CREATED
        );
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    @Operation(
            summary = "Get all warehouses",
            description = "Retrieve paginated warehouses with advanced filtering. Supports filtering by ID, keyword (name, code, address), exact code, name, and active status."
    )
    @Parameters({
            @Parameter(name = "page", description = "Page number (1-indexed)", example = "1", schema = @Schema(type = "integer", defaultValue = "1")),
            @Parameter(name = "size", description = "Number of items per page (max 100)", example = "20", schema = @Schema(type = "integer", defaultValue = "20", maximum = "100")),
            @Parameter(name = "sort", description = "Sorting criteria (e.g. name,asc)", example = "createdAt,desc")
    })
    public ResponseEntity<PageResponse<WarehouseResponse>> getAllWarehouses(
            @Valid WarehouseFilterRequest filter,
            @Parameter(hidden = true) @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(warehouseService.getAllWarehouses(filter, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    @Operation(summary = "Get warehouse by ID", description = "Retrieve detailed information for a specific physical storage location.")
    public ResponseEntity<ApiResponse<WarehouseResponse>> getWarehouseById(
            @Parameter(description = "ID of the warehouse to retrieve") @PathVariable("id") String id) {
        return ResponseEntity.ok(
                ApiResponse.<WarehouseResponse>builder()
                        .success(true)
                        .message("Warehouse fetched successfully")
                        .data(warehouseService.getWarehouseById(id))
                        .build()
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    @Operation(summary = "Update warehouse", description = "Updates an existing warehouse's information. Admin/Manager access required.")
    public ResponseEntity<ApiResponse<WarehouseResponse>> updateWarehouse(
            @Parameter(description = "ID of the warehouse to update") @PathVariable("id") String id,
            @Valid @RequestBody WarehouseRequest request) {
        return ResponseEntity.ok(
                ApiResponse.<WarehouseResponse>builder()
                        .success(true)
                        .message("Warehouse updated successfully")
                        .data(warehouseService.updateWarehouse(id, request))
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Delete warehouse", description = "Permanently deletes a storage location. Super Admin access required.")
    public ResponseEntity<ApiResponse<Void>> deleteWarehouse(
            @Parameter(description = "ID of the warehouse to delete") @PathVariable("id") String id) {
        warehouseService.deleteWarehouse(id);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Warehouse deleted successfully")
                        .build()
        );
    }
}
