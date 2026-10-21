package com.example.ecp_api.controller.system;

import com.example.ecp_api.dto.request.AuditLogFilterRequest;
import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.dto.response.AuditLogResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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
@RequestMapping("/v1/audit-logs")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
@Tag(name = "Audit Logs", description = "Audit Log Management APIs")
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    @Operation(summary = "Get audit logs with optional filtering by action, user, status, and pagination")
    public ResponseEntity<PageResponse<AuditLogResponse>> getAuditLogs(
            @org.springdoc.core.annotations.ParameterObject AuditLogFilterRequest filter,
            @org.springdoc.core.annotations.ParameterObject @PageableDefault(sort = "timestamp", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(auditLogService.getAllLogs(filter, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AuditLogResponse>> getLog(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.<AuditLogResponse>builder().success(true).data(auditLogService.getLogById(id)).build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteLog(@PathVariable String id) {
        auditLogService.deleteLog(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Đã xoá nhật ký.").build());
    }

    @GetMapping("/user/{email}")
    @Operation(summary = "Get audit logs for a specific user email")
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> getLogsByEmail(@PathVariable String email) {
        return ResponseEntity.ok(ApiResponse.<List<AuditLogResponse>>builder()
                .success(true)
                .code("AUDIT_LOGS_FETCHED_SUCCESS")
                .message("Audit logs fetched successfully")
                .data(auditLogService.getLogsByEmail(email))
                .build());
    }
}
