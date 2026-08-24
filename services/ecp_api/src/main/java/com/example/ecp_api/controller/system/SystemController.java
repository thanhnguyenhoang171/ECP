package com.example.ecp_api.controller.system;

import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.service.SystemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/system")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('system:purge') or hasRole('SUPER_ADMIN')")
@Tag(name = "System", description = "System Maintenance APIs")
public class SystemController {

    private final SystemService systemService;

    @PostMapping("/purge")
    @Operation(summary = "Purge all business data while preserving System Accounts and Roles")
    public ResponseEntity<ApiResponse<String>> purgeData() {
        systemService.purgeAllData();
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(true)
                .code("SYSTEM_PURGED_SUCCESS")
                .message("All business data has been successfully purged")
                .data("Business data purged successfully")
                .build());
    }
}
