package com.example.ecp_api.service;


import com.example.ecp_api.dto.request.AuditLogFilterRequest;
import com.example.ecp_api.dto.response.AuditLogResponse;
import com.example.ecp_api.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AuditLogService {
    void log(String action, String email, String details);
    void log(String action, String email, String details, String status);
    PageResponse<AuditLogResponse> getAllLogs(AuditLogFilterRequest filter, Pageable pageable);
    List<AuditLogResponse> getLogsByEmail(String email);
    List<AuditLogResponse> getLogsByUsername(String username);
}
