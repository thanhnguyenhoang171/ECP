package com.example.ecp_api.controller.admin;

import com.example.ecp_api.dto.request.SupplierRequest;
import com.example.ecp_api.dto.request.SupplierRequestFilter;
import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.SupplierAdminResponse;
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
@PreAuthorize("hasAuthority('supplier:read') or hasRole('SUPER_ADMIN')")
@Tag(name = "Suppliers", description = "Supplier Management APIs")
public class AdminSupplierController {

    private final SupplierService supplierService;

    @PostMapping
    @Operation(summary = "Create a new supplier")
    public ResponseEntity<ApiResponse<SupplierAdminResponse>> createSupplier(@Valid @RequestBody SupplierRequest request) {
        return new ResponseEntity<>(ApiResponse.<SupplierAdminResponse>builder()
                .success(true).message("Supplier created successfully").code("SUPPLIER_CREATED")
                .data(supplierService.createSupplierAdmin(request)).build(), HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get all suppliers with full audit info")
    @Parameters({
            @Parameter(name = "page", example = "1", schema = @Schema(type = "integer", defaultValue = "1")),
            @Parameter(name = "size", example = "20", schema = @Schema(type = "integer", defaultValue = "20")),
            @Parameter(name = "sort", example = "createdAt,desc")
    })
    public ResponseEntity<ApiResponse<PageResponse<SupplierAdminResponse>>> getAllSuppliers(
            @Valid SupplierRequestFilter filter,
            @Parameter(hidden = true) @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.<PageResponse<SupplierAdminResponse>>builder()
                .success(true).message("Suppliers fetched successfully (Admin)").code("SUPPLIER_FETCHED")
                .data(supplierService.getAllSuppliersForAdmin(filter, pageable)).build());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get supplier by ID with full audit info")
    public ResponseEntity<ApiResponse<SupplierAdminResponse>> getSupplier(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.<SupplierAdminResponse>builder()
                .success(true).message("Supplier fetched successfully").code("SUPPLIER_FETCHED")
                .data(supplierService.getSupplierByIdForAdmin(id)).build());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update supplier")
    public ResponseEntity<ApiResponse<SupplierAdminResponse>> updateSupplier(
            @PathVariable String id, @Valid @RequestBody SupplierRequest request) {
        return ResponseEntity.ok(ApiResponse.<SupplierAdminResponse>builder()
                .success(true).message("Supplier updated successfully").code("SUPPLIER_UPDATED")
                .data(supplierService.updateSupplierAdmin(id, request)).build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete supplier")
    public ResponseEntity<ApiResponse<Void>> deleteSupplier(@PathVariable String id) {
        supplierService.deleteSupplier(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true).message("Supplier deleted successfully").code("SUPPLIER_DELETED").build());
    }
}
