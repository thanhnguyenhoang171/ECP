package com.example.ecp_api.controller.manager;

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
@RequestMapping("/v1/manager/audit-logs")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('MANAGER', 'SUPER_ADMIN')")
@Tag(name = "[MANAGER] Audit Logs", description = "Manager: Access strictly restricted to MANAGEMENT audit logs (Products, Catalog, Orders, Inventory, Suppliers, Warehouses). System security logs are inaccessible.")
public class ManagerAuditLogController {

    private final AuditLogService auditLogService;
    private final UserService userService;

    @GetMapping
    @Operation(summary = "Get management audit logs with filtering and pagination", description = "Retrieve paginated business operations audit logs. Enforces module=MANAGEMENT filtering automatically.")
    @Parameters({
            @Parameter(name = "page", description = "Page number (1-indexed)", example = "1", schema = @Schema(type = "integer", defaultValue = "1")),
            @Parameter(name = "size", description = "Items per page", example = "50", schema = @Schema(type = "integer", defaultValue = "50")),
            @Parameter(name = "sort", description = "Sorting criteria", example = "timestamp,desc")
    })
    public ResponseEntity<PageResponse<AuditLogResponse>> getManagementLogs(
            AuditLogFilterRequest filter,
            @Parameter(hidden = true) @PageableDefault(size = 50, sort = "timestamp", direction = Sort.Direction.DESC) Pageable pageable) {
        if (filter == null) {
            filter = new AuditLogFilterRequest();
        }
        filter.setModule("MANAGEMENT");
        return ResponseEntity.ok(auditLogService.getAllLogs(filter, pageable));
    }

    @GetMapping("/me")
    @Operation(summary = "Get audit logs for the authenticated manager", description = "Retrieve all management audit logs performed by the currently logged-in Manager account (extracted from Bearer Token).")
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> getMyLogs() {
        String currentUserEmail = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(ApiResponse.<List<AuditLogResponse>>builder()
                .success(true).message("Authenticated manager audit logs fetched successfully")
                .data(auditLogService.getLogsByEmail(currentUserEmail)).build());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get audit logs by User ID", description = "Retrieve activity logs performed by a specific User ID (UUID).")
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> getLogsByUserId(
            @Parameter(description = "User ID (UUID)", example = "123e4567-e89b-12d3-a456-426614174000") @PathVariable String id) {
        UserResponse user = userService.getUserById(UUID.fromString(id));
        return ResponseEntity.ok(ApiResponse.<List<AuditLogResponse>>builder()
                .success(true).message("User audit logs fetched successfully")
                .data(auditLogService.getLogsByEmail(user.getEmail())).build());
    }
}
