package com.example.ecp_api.controller.manager;

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
@RequestMapping("/v1/manager/warehouses")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('MANAGER', 'SUPER_ADMIN')")
@Tag(name = "[MANAGER] Warehouse Management", description = "Manager: CRUD on warehouses. Response excludes audit fields (createdBy, updatedBy).")
public class ManagerWarehouseController {

    private final WarehouseService warehouseService;

    @PostMapping
    @Operation(summary = "Create a new warehouse")
    public ResponseEntity<ApiResponse<WarehouseResponse>> createWarehouse(@Valid @RequestBody WarehouseRequest request) {
        return new ResponseEntity<>(ApiResponse.<WarehouseResponse>builder()
                .success(true).message("Warehouse created successfully").code("WAREHOUSE_CREATED")
                .data(warehouseService.createWarehouse(request)).build(), HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get all warehouses")
    @Parameters({
            @Parameter(name = "page", example = "1", schema = @Schema(type = "integer", defaultValue = "1")),
            @Parameter(name = "size", example = "20", schema = @Schema(type = "integer", defaultValue = "20")),
            @Parameter(name = "sort", example = "name,asc")
    })
    public ResponseEntity<ApiResponse<PageResponse<WarehouseResponse>>> getAllWarehouses(
            @Valid WarehouseFilterRequest filter,
            @Parameter(hidden = true) @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.<PageResponse<WarehouseResponse>>builder()
                .success(true).message("Warehouses fetched successfully").code("WAREHOUSE_FETCHED")
                .data(warehouseService.getAllWarehouses(filter, pageable)).build());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get warehouse by ID")
    public ResponseEntity<ApiResponse<WarehouseResponse>> getWarehouseById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.<WarehouseResponse>builder()
                .success(true).message("Warehouse fetched successfully").code("WAREHOUSE_FETCHED")
                .data(warehouseService.getWarehouseById(id)).build());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update warehouse")
    public ResponseEntity<ApiResponse<WarehouseResponse>> updateWarehouse(
            @PathVariable String id, @Valid @RequestBody WarehouseRequest request) {
        return ResponseEntity.ok(ApiResponse.<WarehouseResponse>builder()
                .success(true).message("Warehouse updated successfully").code("WAREHOUSE_UPDATED")
                .data(warehouseService.updateWarehouse(id, request)).build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete warehouse")
    public ResponseEntity<ApiResponse<Void>> deleteWarehouse(@PathVariable String id) {
        warehouseService.deleteWarehouse(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true).message("Warehouse deleted successfully").code("WAREHOUSE_DELETED").build());
    }
}
