package com.example.ecp_api.service;


import com.example.ecp_api.dto.request.AuditLogFilterRequest;
import com.example.ecp_api.dto.response.AuditLogResponse;
import com.example.ecp_api.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AuditLogService {
    void log(String action, String username, String details);
    void logAuth(String action, String username, String status, String ip, String userAgent, String details);
    void logAction(String action, String username, String resourceType, String resourceId, String details);
    PageResponse<AuditLogResponse> getAllLogs(AuditLogFilterRequest filter, Pageable pageable);
    List<AuditLogResponse> getLogsByUsername(String username);
}
