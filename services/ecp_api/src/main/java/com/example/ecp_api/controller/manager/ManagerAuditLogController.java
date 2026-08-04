package com.example.ecp_api.controller.manager;

import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.dto.response.AuditLogResponse;
import com.example.ecp_api.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/manager/audit-logs")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('MANAGER', 'SUPER_ADMIN')")
@Tag(name = "[MANAGER] Audit Logs", description = "Manager: View audit logs for a specific user only.")
public class ManagerAuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping("/user/{username}")
    @Operation(summary = "Get audit logs by username")
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> getLogsByUsername(@PathVariable String username) {
        return ResponseEntity.ok(ApiResponse.<List<AuditLogResponse>>builder()
                .success(true).message("User audit logs fetched successfully")
                .data(auditLogService.getLogsByUsername(username)).build());
    }
}
