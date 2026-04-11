package com.example.ecp_api.controller;

import com.example.ecp_api.dto.response.AuditLogResponse;
import com.example.ecp_api.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<List<AuditLogResponse>> getAllLogs() {
        return ResponseEntity.ok(auditLogService.getAllLogs());
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<List<AuditLogResponse>> getLogsByUsername(@PathVariable String username) {
        return ResponseEntity.ok(auditLogService.getLogsByUsername(username));
    }
}
