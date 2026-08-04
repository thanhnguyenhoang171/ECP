package com.example.ecp_api.controller.admin;

import com.example.ecp_api.dto.request.AuditLogFilterRequest;
import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.dto.response.AuditLogResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/admin/audit-logs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN')")
@Tag(name = "[ADMIN] Audit Logs", description = "Super Admin only: View system activity audit logs. Read-only access to track all operations.")
public class AdminAuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    @Operation(summary = "Get all audit logs with filtering and pagination")
    @Parameters({
            @Parameter(name = "page", example = "1", schema = @Schema(type = "integer", defaultValue = "1")),
            @Parameter(name = "size", example = "50", schema = @Schema(type = "integer", defaultValue = "50")),
            @Parameter(name = "sort", example = "timestamp,desc")
    })
    public ResponseEntity<PageResponse<AuditLogResponse>> getAllLogs(
            AuditLogFilterRequest filter,
            @Parameter(hidden = true) @PageableDefault(size = 50, sort = "timestamp", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(auditLogService.getAllLogs(filter, pageable));
    }

    @GetMapping("/user/{username}")
    @Operation(summary = "Get audit logs for a specific user")
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> getLogsByUsername(@PathVariable String username) {
        return ResponseEntity.ok(ApiResponse.<List<AuditLogResponse>>builder()
                .success(true).message("User audit logs fetched successfully")
                .data(auditLogService.getLogsByUsername(username)).build());
    }
}
