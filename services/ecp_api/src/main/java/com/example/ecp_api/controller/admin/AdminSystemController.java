package com.example.ecp_api.controller.admin;

import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.service.SystemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/admin/system")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('system:purge') or hasRole('SUPER_ADMIN')")
@Tag(name = "[ADMIN] System Management", description = "Management API: System maintenance operations.")
public class AdminSystemController {

    private final SystemService systemService;

    @PostMapping("/purge-data")
    @Operation(summary = "⚠️ Purge ALL system data",
            description = "DANGER: Permanently deletes ALL data from MySQL and MongoDB and re-initializes default accounts. CANNOT BE UNDONE.")
    public ResponseEntity<ApiResponse<Void>> purgeAllData() {
        systemService.purgeAllData();
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true).code("SYSTEM_DATA_PURGED")
                .message("System data has been purged and re-initialized successfully.").build());
    }
}
