package com.example.ecp_api.controller;

import com.example.ecp_api.dto.request.SupplierRequest;
import com.example.ecp_api.dto.request.SupplierRequestFilter;
import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.SupplierResponse;
import com.example.ecp_api.service.SupplierService;
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
@RequestMapping("/v1/suppliers")
@RequiredArgsConstructor
@Tag(name = "Supplier Management", description = "APIs for managing product suppliers")
public class SupplierController {

    private final SupplierService supplierService;

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    @Operation(summary = "Create a new supplier", description = "Creates a new product supplier. Admin/Manager access required.")
    public ResponseEntity<ApiResponse<SupplierResponse>> createSupplier(@Valid @RequestBody SupplierRequest request) {
        SupplierResponse response = supplierService.createSupplier(request);
        return new ResponseEntity<>(
                ApiResponse.<SupplierResponse>builder()
                        .success(true)
                        .message("Supplier created successfully")
                        .data(response)
                        .build(),
                HttpStatus.CREATED
        );
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    @Operation(
            summary = "Get all suppliers",
            description = "Retrieve paginated list of suppliers with advanced filtering. Supports searching by keyword (name, email, tax code) and active status."
    )
    @Parameters({
            @Parameter(name = "page", description = "Page number (1-indexed)", example = "1", schema = @Schema(type = "integer", defaultValue = "1")),
            @Parameter(name = "size", description = "Number of items per page (max 100)", example = "20", schema = @Schema(type = "integer", defaultValue = "20", maximum = "100")),
            @Parameter(name = "sort", description = "Sorting criteria (e.g. name,asc)", example = "createdAt,desc")
    })
    public ResponseEntity<PageResponse<SupplierResponse>> getAllSuppliers(
            @Valid SupplierRequestFilter filter,
            @Parameter(hidden = true) @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(supplierService.getAllSuppliers(filter, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    @Operation(summary = "Get supplier by ID", description = "Retrieve detailed information for a specific supplier.")
    public ResponseEntity<ApiResponse<SupplierResponse>> getSupplier(
            @Parameter(description = "ID of the supplier to retrieve") @PathVariable String id) {
        return ResponseEntity.ok(
                ApiResponse.<SupplierResponse>builder()
                        .success(true)
                        .message("Supplier fetched successfully")
                        .data(supplierService.getSupplierById(id))
                        .build()
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    @Operation(summary = "Update supplier", description = "Updates an existing supplier's information.")
    public ResponseEntity<ApiResponse<SupplierResponse>> updateSupplier(
            @Parameter(description = "ID of the supplier to update") @PathVariable String id,
            @Valid @RequestBody SupplierRequest request) {
        return ResponseEntity.ok(
                ApiResponse.<SupplierResponse>builder()
                        .success(true)
                        .message("Supplier updated successfully")
                        .data(supplierService.updateSupplier(id, request))
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Delete supplier", description = "Permanently deletes a supplier from the system. Super Admin access required.")
    public ResponseEntity<ApiResponse<Void>> deleteSupplier(
            @Parameter(description = "ID of the supplier to delete") @PathVariable String id) {
        supplierService.deleteSupplier(id);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Supplier deleted successfully")
                        .build()
        );
    }
}
