package com.example.ecp_api.controller;

import com.example.ecp_api.dto.request.AuditLogFilterRequest;
import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.dto.response.AuditLogResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.service.AuditLogService;
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
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN')")
    public ResponseEntity<PageResponse<AuditLogResponse>> getAllLogs(AuditLogFilterRequest filter, @PageableDefault(sort = "timestamp", direction = Sort.Direction.DESC) Pageable pageable  ) {
        return ResponseEntity.ok(auditLogService.getAllLogs(filter, pageable));
    }

    @GetMapping("/user/{username}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> getLogsByUsername(@PathVariable("username") String username) {
        List<AuditLogResponse> logs = auditLogService.getLogsByUsername(username);
        ApiResponse<List<AuditLogResponse>> apiResponse = ApiResponse.<List<AuditLogResponse>>builder()
                .success(true)
                .message("User audit logs fetched successfully")
                .data(logs)
                .build();
        return ResponseEntity.ok(apiResponse);
    }
}
