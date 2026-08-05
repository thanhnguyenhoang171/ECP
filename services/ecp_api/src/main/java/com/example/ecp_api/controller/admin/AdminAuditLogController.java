package com.example.ecp_api.controller.admin;

import com.example.ecp_api.dto.request.AuditLogFilterRequest;
import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.dto.response.AuditLogResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.UserResponse;
import com.example.ecp_api.service.AuditLogService;
import com.example.ecp_api.service.UserService;
import com.example.ecp_api.util.SecurityUtils;
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
import java.util.UUID;

@RestController
@RequestMapping("/v1/admin/audit-logs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN')")
@Tag(name = "[ADMIN] Audit Logs", description = "Super Admin only: Full access to query both SYSTEM (Auth, User, Role) and MANAGEMENT (Product, Order, Inventory) audit logs.")
public class AdminAuditLogController {

    private final AuditLogService auditLogService;
    private final UserService userService;

    @GetMapping
    @Operation(summary = "Get all system and management audit logs", description = "Retrieve paginated system activity logs with advanced filtering (by category, domain, email, action, keyword).")
    @Parameters({
            @Parameter(name = "page", description = "Page number (1-indexed)", example = "1", schema = @Schema(type = "integer", defaultValue = "1")),
            @Parameter(name = "size", description = "Items per page", example = "50", schema = @Schema(type = "integer", defaultValue = "50")),
            @Parameter(name = "sort", description = "Sorting criteria", example = "timestamp,desc")
    })
    public ResponseEntity<PageResponse<AuditLogResponse>> getAllLogs(
            AuditLogFilterRequest filter,
            @Parameter(hidden = true) @PageableDefault(size = 50, sort = "timestamp", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(auditLogService.getAllLogs(filter, pageable));
    }

    @GetMapping("/me")
    @Operation(summary = "Get audit logs for the authenticated admin", description = "Retrieve all audit logs performed by the currently logged-in Admin account (extracted from Bearer Token).")
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> getMyLogs() {
        String currentUserEmail = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(ApiResponse.<List<AuditLogResponse>>builder()
                .success(true).message("Authenticated admin audit logs fetched successfully")
                .data(auditLogService.getLogsByEmail(currentUserEmail)).build());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get audit logs by User ID", description = "Retrieve all activity logs performed by a specific User ID (UUID).")
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> getLogsByUserId(
            @Parameter(description = "User ID (UUID)", example = "123e4567-e89b-12d3-a456-426614174000") @PathVariable String id) {
        UserResponse user = userService.getUserById(UUID.fromString(id));
        return ResponseEntity.ok(ApiResponse.<List<AuditLogResponse>>builder()
                .success(true).message("User audit logs fetched successfully")
                .data(auditLogService.getLogsByEmail(user.getEmail())).build());
    }
}
