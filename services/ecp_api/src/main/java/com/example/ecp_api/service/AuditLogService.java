package com.example.ecp_api.service;

import com.example.ecp_api.dto.response.AuditLogResponse;
import com.example.ecp_api.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AuditLogService {
    void log(String action, String username, String details);
    PageResponse<AuditLogResponse> getAllLogs(Pageable pageable);
    List<AuditLogResponse> getLogsByUsername(String username);
}
