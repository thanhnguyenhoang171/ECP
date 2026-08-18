package com.example.ecp_api.controller;

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
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Sort;

import java.util.List;

@RestController
@RequestMapping("/v1/audit-logs")
@RequiredArgsConstructor
@Tag(name = "Audit Logs", description = "Global Audit Logs API: Retrieve system and business activity audit logs.")
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN')")
    @Operation(
            summary = "Get all audit logs",
            description = "Retrieve paginated system-wide activity logs with filtering by category, domain, email, action, keyword. Super Admin access required."
    )
    @Parameters({
            @Parameter(name = "page", description = "Page number (1-indexed)", example = "1", schema = @Schema(type = "integer", defaultValue = "1")),
            @Parameter(name = "size", description = "Number of items per page (max 100)", example = "20", schema = @Schema(type = "integer", defaultValue = "20", maximum = "100")),
            @Parameter(name = "sort", description = "Sorting criteria (e.g. timestamp,desc)", example = "timestamp,desc")
    })
    public ResponseEntity<PageResponse<AuditLogResponse>> getAllLogs(
            AuditLogFilterRequest filter,
            @Parameter(hidden = true) @PageableDefault(sort = "timestamp", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(auditLogService.getAllLogs(filter, pageable));
    }

    @GetMapping("/email/{email}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN')")
    @Operation(summary = "Get logs by email", description = "Retrieve all activity logs for a specific user email.")
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> getLogsByEmail(
            @Parameter(description = "User email address", example = "admin@example.com") @PathVariable("email") String email) {
        List<AuditLogResponse> logs = auditLogService.getLogsByEmail(email);
        ApiResponse<List<AuditLogResponse>> apiResponse = ApiResponse.<List<AuditLogResponse>>builder()
                .success(true)
                .message("User audit logs fetched successfully")
                .data(logs)
                .build();
        return ResponseEntity.ok(apiResponse);
    }
}
