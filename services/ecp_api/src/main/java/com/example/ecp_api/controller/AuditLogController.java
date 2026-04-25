package com.example.ecp_api.controller;

import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.dto.response.AuditLogResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<PageResponse<AuditLogResponse>> getAllLogs(Pageable pageable) {
        return ResponseEntity.ok(auditLogService.getAllLogs(pageable));
    }

    @GetMapping("/user/{username}")
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
