package com.example.ecp_api.controller.inventory;

import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.dto.response.BarcodeLookupResponse;
import com.example.ecp_api.service.BarcodeLookupService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/v1/inventory/barcode")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('inventory:read') or hasRole('SUPER_ADMIN')")
public class BarcodeController {
    private final BarcodeLookupService service;

    @GetMapping
    @Operation(summary = "Look up a barcode or SKU and current stock batches in accessible warehouses")
    public ResponseEntity<ApiResponse<BarcodeLookupResponse>> lookup(@RequestParam String code,
            @RequestParam(required = false) UUID warehouseId) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(ApiResponse.<BarcodeLookupResponse>builder()
                .success(true).data(service.lookup(code, warehouseId)).build());
    }
}
