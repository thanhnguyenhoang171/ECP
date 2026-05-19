package com.example.ecp_api.service.impl;

import com.example.ecp_api.dto.request.AuditLogFilterRequest;
import com.example.ecp_api.dto.response.AuditLogResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.entity.mongodb.AuditLog;
import com.example.ecp_api.mapper.AuditLogMapper;
import com.example.ecp_api.repository.mongodb.AuditLogRepository;
import com.example.ecp_api.service.AuditLogService;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;


import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final MongoTemplate mongoTemplate;
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
    public PageResponse<AuditLogResponse> getAllLogs(AuditLogFilterRequest filter, Pageable pageable) {

        Query query = new Query().with(pageable);

        if (StringUtils.hasText(filter.getAction())) {
            query.addCriteria(Criteria.where("action").regex(filter.getAction(), "i"));
        }

        if (StringUtils.hasText(filter.getUsername())) {
            query.addCriteria(Criteria.where("username").regex(filter.getUsername(), "i"));
        }

        long count = mongoTemplate.count(Query.of(query).limit(-1).skip(-1), AuditLog.class);
        List<AuditLog> auditLogs = mongoTemplate.find(query, AuditLog.class);

        Page<AuditLog> auditLogPage = new PageImpl<>(auditLogs, pageable, count);
        
        return auditLogMapper.toPageResponse(auditLogPage);
    }

    @Override
    public List<AuditLogResponse> getLogsByUsername(String username) {
        return auditLogRepository.findByUsername(username).stream()
                .map(auditLogMapper::toResponse)
                .collect(Collectors.toList());
    }
}
