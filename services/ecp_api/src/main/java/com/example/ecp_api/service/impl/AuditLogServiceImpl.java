package com.example.ecp_api.service.impl;

import com.example.ecp_api.dto.request.AuditLogFilterRequest;
import com.example.ecp_api.dto.response.AuditLogResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.entity.mongodb.AuditLog;
import com.example.ecp_api.mapper.AuditLogMapper;
import com.example.ecp_api.repository.mongodb.AuditLogRepository;
import com.example.ecp_api.repository.jpa.UserRepository;
import com.example.ecp_api.exception.AppException;
import org.springframework.http.HttpStatus;
import com.example.ecp_api.service.AuditLogService;
import com.example.ecp_api.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import com.example.ecp_api.util.IpUtils;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final MongoTemplate mongoTemplate;
    private final AuditLogMapper auditLogMapper;
    private final UserRepository userRepository;

    private String determineLogType(String username) {
        if (!StringUtils.hasText(username) || "SYSTEM".equalsIgnoreCase(username)) {
            return "SYSTEM";
        }
        if (username.equalsIgnoreCase(SecurityUtils.getCurrentUserEmail())) {
            if (SecurityUtils.isSuperAdmin()) return "ADMIN";
            if (SecurityUtils.isManager()) return "MANAGER";
            return "USER";
        }
        return userRepository.findByEmail(username)
                .map(user -> {
                    if (user.hasRole("SUPER_ADMIN")) {
                        return "ADMIN";
                    } else if (user.hasRole("MANAGER")) {
                        return "MANAGER";
                    }
                    return "USER";
                })
                .orElse("SYSTEM");
    }

    private String determineModule(String action) {
        if (!StringUtils.hasText(action)) return "SYSTEM";
        String upperAction = action.toUpperCase();
        if (upperAction.startsWith("API_") || upperAction.startsWith("SYSTEM_") || upperAction.contains("LOGIN") || upperAction.contains("LOGOUT") || upperAction.contains("AUTH")
                || upperAction.contains("REGISTER") || upperAction.contains("PASSWORD")
                || upperAction.contains("TOKEN") || upperAction.contains("SECURITY")) {
            return "SYSTEM";
        }
        return "MANAGEMENT";
    }

    private String determineDomain(String action) {
        if (!StringUtils.hasText(action)) return "SYSTEM";
        String upper = action.toUpperCase();
        if (upper.startsWith("AUTH_") || upper.contains("LOGIN") || upper.contains("LOGOUT") || upper.contains("TOKEN")) return "AUTH";
        if (upper.contains("USER")) return "USER";
        if (upper.contains("ROLE") || upper.contains("PERMISSION")) return "ROLE";
        if (upper.contains("PRODUCT") || upper.contains("CATEGORY") || upper.contains("BRAND") || upper.contains("SUPPLIER")) return "CATALOG";
        if (upper.contains("WAREHOUSE") || upper.contains("INVENTORY") || upper.contains("GOODS_RECEIPT")) return "INVENTORY";
        if (upper.contains("PURCHASE_ORDER")) return "PURCHASE_ORDER";
        if (upper.contains("SALES_ORDER") || upper.contains("ORDER")) return "SALES_ORDER";
        if (upper.contains("PAYMENT") || upper.contains("REFUND") || upper.contains("LEDGER")) return "FINANCE";
        if (upper.contains("VOUCHER") || upper.contains("PROMOTION")) return "PROMOTION";
        if (upper.contains("CUSTOMER")) return "CUSTOMER";
        int idx = upper.indexOf('_');
        if (idx > 0) {
            return upper.substring(0, idx);
        }
        return "GENERAL";
    }

    private String getCurrentIpAddress() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            return IpUtils.getClientIp(attributes.getRequest());
        }
        return "SYSTEM";
    }

    private String getCurrentUserAgent() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            return attributes.getRequest().getHeader("User-Agent");
        }
        return "SYSTEM";
    }

    @Override
    public void log(String action, String userEmail, String details) {
        log(action, userEmail, details, "SUCCESS");
    }

    @Override
    public void log(String action, String userEmail, String details, String status) {
        String module = determineModule(action);
        String currentActor = SecurityUtils.getCurrentUserEmail();
        String actor = "SYSTEM".equals(currentActor) ? userEmail : currentActor;
        AuditLog auditLog = AuditLog.builder()
                .action(action)
                .email(actor)
                .username(actor)
                .details(details)
                .timestamp(LocalDateTime.now())
                .status(status)
                .logType(determineLogType(actor))
                .module(module)
                .category(module)
                .domain(determineDomain(action))
                .ipAddress(getCurrentIpAddress())
                .userAgent(getCurrentUserAgent())
                .build();
        
        auditLogRepository.save(auditLog);
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
        validateReader();
        if (pageable.getSort().stream().anyMatch(order -> !java.util.Set.of("timestamp", "action", "email", "status", "module", "domain", "logType").contains(order.getProperty()))) {
            throw new AppException("INVALID_SORT", "Trường sắp xếp nhật ký không hợp lệ.", HttpStatus.BAD_REQUEST);
        }
        pageable = PageRequest.of(pageable.getPageNumber(), Math.min(pageable.getPageSize(), 200), pageable.getSort());
        Query query = buildQuery(filter).with(pageable);

        long count = mongoTemplate.count(Query.of(query).limit(-1).skip(-1), AuditLog.class);
        List<AuditLog> auditLogs = mongoTemplate.find(query, AuditLog.class);

        Page<AuditLog> auditLogPage = new PageImpl<>(auditLogs, pageable, count);
        
        return auditLogMapper.toPageResponse(auditLogPage);
    }

    @Override
    public List<AuditLogResponse> getLogsByEmail(String email) {
        validateReader();
        if (!SecurityUtils.isSuperAdmin() && !SecurityUtils.getCurrentUserEmail().equalsIgnoreCase(email)) { return List.of(); }
        Query query = buildQuery(new AuditLogFilterRequest(), email);
        query.with(Sort.by(Sort.Direction.DESC, "timestamp")).limit(200);
        return mongoTemplate.find(query, AuditLog.class).stream().map(auditLogMapper::toResponse).toList();
    }

    @Override
    public AuditLogResponse getLogById(String id) {
        validateReader();
        Query query = buildQuery(new AuditLogFilterRequest());
        query.addCriteria(Criteria.where("id").is(id));
        AuditLog entry = mongoTemplate.findOne(query, AuditLog.class);
        if (entry == null) { throw new AppException("AUDIT_NOT_FOUND", "Không tìm thấy nhật ký trong phạm vi của bạn.", HttpStatus.NOT_FOUND); }
        return auditLogMapper.toResponse(entry);
    }

    @Override
    public void deleteLog(String id) {
        if (!SecurityUtils.isSuperAdmin()) { throw new AppException("DATA_ACCESS_DENIED", "Chỉ Super Admin được xoá nhật ký.", HttpStatus.FORBIDDEN); }
        AuditLog entry = mongoTemplate.findById(id, AuditLog.class);
        if (entry == null) { throw new AppException("AUDIT_NOT_FOUND", "Không tìm thấy nhật ký.", HttpStatus.NOT_FOUND); }
        mongoTemplate.remove(entry);
        log("SYSTEM_AUDIT_DELETE", SecurityUtils.getCurrentUserEmail(), "Deleted audit log " + id + " (" + entry.getAction() + ")");
    }

    private void validateReader() {
        if (!SecurityUtils.isSuperAdmin() && !SecurityUtils.isManager()) {
            throw new AppException("DATA_ACCESS_DENIED", "Bạn không có quyền xem nhật ký kiểm toán.", HttpStatus.FORBIDDEN);
        }
    }

    private Query buildQuery(AuditLogFilterRequest filter) {
        return buildQuery(filter, null);
    }

    private Query buildQuery(AuditLogFilterRequest filter, String exactEmail) {
        List<Criteria> criteria = new java.util.ArrayList<>();
        if (exactEmail != null) {
            criteria.add(new Criteria().orOperator(Criteria.where("email").is(exactEmail),
                    new Criteria().andOperator(Criteria.where("email").is(null), Criteria.where("username").is(exactEmail))));
        }
        if (!SecurityUtils.isSuperAdmin()) {
            String actor = SecurityUtils.getCurrentUserEmail();
            // email is authoritative; username is only a fallback for legacy records.
            criteria.add(new Criteria().orOperator(Criteria.where("email").is(actor),
                    new Criteria().andOperator(Criteria.where("email").is(null), Criteria.where("username").is(actor))));
            criteria.add(new Criteria().orOperator(
                    new Criteria().andOperator(Criteria.where("module").is("MANAGEMENT"),
                            new Criteria().orOperator(Criteria.where("category").is("MANAGEMENT"), Criteria.where("category").is(null))),
                    new Criteria().andOperator(Criteria.where("module").is(null), Criteria.where("category").is("MANAGEMENT"))));
        }
        if (StringUtils.hasText(filter.getKeyword())) {
            String pattern = java.util.regex.Pattern.quote(filter.getKeyword());
            criteria.add(new Criteria().orOperator(Criteria.where("action").regex(pattern, "i"), Criteria.where("email").regex(pattern, "i"),
                    Criteria.where("username").regex(pattern, "i"), Criteria.where("details").regex(pattern, "i"), Criteria.where("ipAddress").regex(pattern, "i")));
        }
        String email = StringUtils.hasText(filter.getEmail()) ? filter.getEmail() : filter.getUsername();
        if (StringUtils.hasText(email)) {
            String pattern = java.util.regex.Pattern.quote(email);
            criteria.add(new Criteria().orOperator(Criteria.where("email").regex(pattern, "i"), Criteria.where("username").regex(pattern, "i")));
        }
        if (StringUtils.hasText(filter.getAction())) { criteria.add(Criteria.where("action").regex(java.util.regex.Pattern.quote(filter.getAction()), "i")); }
        if (StringUtils.hasText(filter.getLogType())) { criteria.add(Criteria.where("logType").is(filter.getLogType())); }
        if (StringUtils.hasText(filter.getModule())) { criteria.add(Criteria.where("module").is(filter.getModule())); }
        if (StringUtils.hasText(filter.getCategory())) { criteria.add(Criteria.where("category").is(filter.getCategory())); }
        if (StringUtils.hasText(filter.getDomain())) { criteria.add(Criteria.where("domain").is(filter.getDomain())); }
        if (StringUtils.hasText(filter.getStatus())) { criteria.add(Criteria.where("status").is(filter.getStatus())); }
        if (filter.getFrom() != null && filter.getTo() != null && filter.getFrom().isAfter(filter.getTo())) {
            throw new AppException("INVALID_DATE_RANGE", "Ngày bắt đầu phải trước ngày kết thúc.", HttpStatus.BAD_REQUEST);
        }
        if (filter.getFrom() != null || filter.getTo() != null) {
            Criteria timestamp = Criteria.where("timestamp");
            if (filter.getFrom() != null) { timestamp.gte(filter.getFrom()); }
            if (filter.getTo() != null) { timestamp.lte(filter.getTo()); }
            criteria.add(timestamp);
        }
        return criteria.isEmpty() ? new Query() : Query.query(new Criteria().andOperator(criteria.toArray(new Criteria[0])));
    }

    @Override
    public List<AuditLogResponse> getLogsByUsername(String username) {
        return getLogsByEmail(username);
    }
}
