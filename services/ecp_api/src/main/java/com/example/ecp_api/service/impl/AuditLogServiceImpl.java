package com.example.ecp_api.service.impl;

import com.example.ecp_api.dto.request.AuditLogFilterRequest;
import com.example.ecp_api.dto.response.AuditLogResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.entity.mongodb.ActionAuditLog;
import com.example.ecp_api.entity.mongodb.AuditLog;
import com.example.ecp_api.entity.mongodb.AuthAuditLog;
import com.example.ecp_api.mapper.AuditLogMapper;
import com.example.ecp_api.repository.mongodb.AuditLogRepository;
import com.example.ecp_api.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final MongoTemplate mongoTemplate;
    private final AuditLogMapper auditLogMapper;

    @Override
    public void log(String action, String username, String details) {
        String upperAction = action != null ? action.toUpperCase() : "";
        AuditLog auditLog;

        if (upperAction.contains("LOGIN") || upperAction.contains("LOGOUT") || upperAction.contains("AUTH")) {
            auditLog = AuthAuditLog.builder()
                    .action(action)
                    .username(username)
                    .details(details)
                    .timestamp(LocalDateTime.now())
                    .status("SUCCESS") // Default for generic log call
                    .build();
        } else {
            auditLog = ActionAuditLog.builder()
                    .action(action)
                    .username(username)
                    .details(details)
                    .timestamp(LocalDateTime.now())
                    .build();
        }
        
        auditLogRepository.save(auditLog);
    }

    @Override
    public void logAuth(String action, String username, String status, String ip, String userAgent, String details) {
        AuthAuditLog authLog = AuthAuditLog.builder()
                .action(action)
                .username(username)
                .status(status)
                .ipAddress(ip)
                .userAgent(userAgent)
                .details(details)
                .timestamp(LocalDateTime.now())
                .build();
        auditLogRepository.save(authLog);
    }

    @Override
    public void logAction(String action, String username, String resourceType, String resourceId, String details) {
        ActionAuditLog actionLog = ActionAuditLog.builder()
                .action(action)
                .username(username)
                .resourceType(resourceType)
                .resourceId(resourceId)
                .details(details)
                .timestamp(LocalDateTime.now())
                .build();
        auditLogRepository.save(actionLog);
    }

    /**
     * Tác vụ chạy ngầm để xóa Audit Log cũ hơn 90 ngày.
     * Chạy vào lúc 1 giờ sáng hàng ngày.
     */
    @Scheduled(cron = "0 0 1 * * *")
    public void cleanOldLogs() {
        LocalDateTime expiryDate = LocalDateTime.now().minusDays(90);
        log.info("Bắt đầu dọn dẹp Audit Log cũ hơn 90 ngày (trước ngày: {})", expiryDate);
        try {
            auditLogRepository.deleteByTimestampBefore(expiryDate);
            log.info("Dọn dẹp Audit Log hoàn tất.");
        } catch (Exception e) {
            log.error("Lỗi khi dọn dẹp Audit Log: {}", e.getMessage());
        }
    }

    @Override
    public PageResponse<AuditLogResponse> getAllLogs(AuditLogFilterRequest filter, Pageable pageable) {
        Query query = new Query().with(pageable);

        if (StringUtils.hasText(filter.getKeyword())) {
            String pattern = filter.getKeyword();
            query.addCriteria(new Criteria().orOperator(
                    Criteria.where("action").regex(pattern, "i"),
                    Criteria.where("username").regex(pattern, "i"),
                    Criteria.where("details").regex(pattern, "i"),
                    Criteria.where("ipAddress").regex(pattern, "i")
            ));
        }

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
