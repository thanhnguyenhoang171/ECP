package com.example.ecp_api.service.impl;

import com.example.ecp_api.dto.response.AuditLogResponse;
import com.example.ecp_api.entity.mongodb.AuditLog;
import com.example.ecp_api.mapper.AuditLogMapper;
import com.example.ecp_api.repository.mongodb.AuditLogRepository;
import com.example.ecp_api.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final AuditLogMapper auditLogMapper;

    @Override
    public void log(String action, String username, String details) {
        AuditLog auditLog = AuditLog.builder()
                .action(action)
                .username(username)
                .details(details)
                .timestamp(LocalDateTime.now())
                .build();
        auditLogRepository.save(auditLog);
    }

    @Override
    public List<AuditLogResponse> getAllLogs() {
        return auditLogRepository.findAll().stream()
                .map(auditLogMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<AuditLogResponse> getLogsByUsername(String username) {
        return auditLogRepository.findByUsername(username).stream()
                .map(auditLogMapper::toResponse)
                .collect(Collectors.toList());
    }
}
