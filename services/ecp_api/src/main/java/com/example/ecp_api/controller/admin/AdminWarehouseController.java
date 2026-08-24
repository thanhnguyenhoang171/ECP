package com.example.ecp_api.controller.admin;

import com.example.ecp_api.dto.request.WarehouseFilterRequest;
import com.example.ecp_api.dto.request.WarehouseRequest;
import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.WarehouseAdminResponse;
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
@PreAuthorize("hasAuthority('warehouse:read') or hasRole('SUPER_ADMIN')")
@Tag(name = "Warehouses", description = "Warehouse Management APIs")
public class AdminWarehouseController {

    private final WarehouseService warehouseService;

    @PostMapping
    @Operation(summary = "Create a new warehouse")
    public ResponseEntity<ApiResponse<WarehouseAdminResponse>> createWarehouse(@Valid @RequestBody WarehouseRequest request) {
        return new ResponseEntity<>(ApiResponse.<WarehouseAdminResponse>builder()
                .success(true).message("Warehouse created successfully").code("WAREHOUSE_CREATED")
                .data(warehouseService.createWarehouseAdmin(request)).build(), HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get all warehouses with full audit info")
    @Parameters({
            @Parameter(name = "page", example = "1", schema = @Schema(type = "integer", defaultValue = "1")),
            @Parameter(name = "size", example = "20", schema = @Schema(type = "integer", defaultValue = "20")),
            @Parameter(name = "sort", example = "name,asc")
    })
    public ResponseEntity<ApiResponse<PageResponse<WarehouseAdminResponse>>> getAllWarehouses(
            @Valid WarehouseFilterRequest filter,
            @Parameter(hidden = true) @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.<PageResponse<WarehouseAdminResponse>>builder()
                .success(true).message("Warehouses fetched successfully (Admin)").code("WAREHOUSE_FETCHED")
                .data(warehouseService.getAllWarehousesForAdmin(filter, pageable)).build());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get warehouse by ID with full audit info")
    public ResponseEntity<ApiResponse<WarehouseAdminResponse>> getWarehouseById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.<WarehouseAdminResponse>builder()
                .success(true).message("Warehouse fetched successfully").code("WAREHOUSE_FETCHED")
                .data(warehouseService.getWarehouseByIdForAdmin(id)).build());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update warehouse")
    public ResponseEntity<ApiResponse<WarehouseAdminResponse>> updateWarehouse(
            @PathVariable String id, @Valid @RequestBody WarehouseRequest request) {
        return ResponseEntity.ok(ApiResponse.<WarehouseAdminResponse>builder()
                .success(true).message("Warehouse updated successfully").code("WAREHOUSE_UPDATED")
                .data(warehouseService.updateWarehouseAdmin(id, request)).build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete warehouse")
    public ResponseEntity<ApiResponse<Void>> deleteWarehouse(@PathVariable String id) {
        warehouseService.deleteWarehouse(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true).message("Warehouse deleted successfully").code("WAREHOUSE_DELETED").build());
    }
}
