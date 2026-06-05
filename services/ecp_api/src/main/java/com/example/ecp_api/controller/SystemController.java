package com.example.ecp_api.controller;

import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.service.SystemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/system")
@RequiredArgsConstructor
@Tag(name = "System Administration", description = "High-level system maintenance and administrative APIs")
public class SystemController {

    private final SystemService systemService;

    @PostMapping("/purge-data")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Purge all system data", description = "DANGER: This operation will permanently delete all data from both MySQL and MongoDB databases and re-initialize default accounts. Super Admin access required.")
    public ResponseEntity<ApiResponse<Void>> purgeAllData() {
        systemService.purgeAllData();
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .code("SYSTEM_DATA_PURGED")
                        .message("System data has been purged and re-initialized successfully.")
                        .build()
        );
    }
}
