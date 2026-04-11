package com.example.ecp_api.service;

import com.example.ecp_api.dto.response.AuditLogResponse;
import java.util.List;

public interface AuditLogService {
    void log(String action, String username, String details);
    List<AuditLogResponse> getAllLogs();
    List<AuditLogResponse> getLogsByUsername(String username);
}
