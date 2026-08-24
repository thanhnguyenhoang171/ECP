package com.example.ecp_api.controller.inventory;

import com.example.ecp_api.dto.request.SupplierRequest;
import com.example.ecp_api.dto.request.SupplierRequestFilter;
import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.SupplierResponse;
import com.example.ecp_api.service.SupplierService;
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
@RequestMapping("/v1/suppliers")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('supplier:read') or hasRole('SUPER_ADMIN')")
@Tag(name = "Suppliers", description = "Supplier Management APIs")
public class SupplierController {

    private final SupplierService supplierService;

    @GetMapping
    @Operation(summary = "Get all suppliers with filtering")
    public ResponseEntity<PageResponse<SupplierResponse>> getAllSuppliers(
            SupplierRequestFilter filter,
            Pageable pageable) {
        return ResponseEntity.ok(supplierService.getAllSuppliers(filter, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get supplier by ID")
    public ResponseEntity<ApiResponse<SupplierResponse>> getSupplierById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.<SupplierResponse>builder()
                .success(true)
                .code("SUPPLIER_FETCHED_SUCCESS")
                .message("Supplier fetched successfully")
                .data(supplierService.getSupplierById(id)).build());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('supplier:create') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Create a new supplier")
    public ResponseEntity<ApiResponse<SupplierResponse>> createSupplier(@Valid @RequestBody SupplierRequest request) {
        return new ResponseEntity<>(ApiResponse.<SupplierResponse>builder()
                .success(true)
                .code("SUPPLIER_CREATED_SUCCESS")
                .message("Supplier created successfully")
                .data(supplierService.createSupplier(request)).build(), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('supplier:update') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Update supplier details")
    public ResponseEntity<ApiResponse<SupplierResponse>> updateSupplier(@PathVariable String id, @Valid @RequestBody SupplierRequest request) {
        return ResponseEntity.ok(ApiResponse.<SupplierResponse>builder()
                .success(true)
                .code("SUPPLIER_UPDATED_SUCCESS")
                .message("Supplier updated successfully")
                .data(supplierService.updateSupplier(id, request)).build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('supplier:delete') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Delete supplier")
    public ResponseEntity<ApiResponse<Void>> deleteSupplier(@PathVariable String id) {
        supplierService.deleteSupplier(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .code("SUPPLIER_DELETED_SUCCESS")
                .message("Supplier deleted successfully").build());
    }
}
