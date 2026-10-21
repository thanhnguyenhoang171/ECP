package com.example.ecp_api.service.impl;

import com.example.ecp_api.config.DataInitializer;
import com.example.ecp_api.service.AuditLogService;
import com.example.ecp_api.service.SystemService;
import com.example.ecp_api.service.StorageService;
import com.example.ecp_api.service.PurgePasswordService;
import com.example.ecp_api.entity.mongodb.AuditLog;
import com.example.ecp_api.exception.AppException;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SystemServiceImpl implements SystemService {

    @PersistenceContext
    private EntityManager entityManager;

    private final PurgePasswordService purgePasswordService;
    private final MongoTemplate mongoTemplate;
    private final DataInitializer dataInitializer;
    private final AuditLogService auditLogService;
    private final StorageService storageService;

    @Override
    @Transactional
    public void purgeAllData(String password) {
        String currentEmail = com.example.ecp_api.util.SecurityUtils.getCurrentUserEmail();
        try {
            purgePasswordService.verifyPassword(password);
        } catch (RuntimeException error) {
            String reason = error instanceof AppException appError ? appError.getCode() : error.getClass().getSimpleName();
            auditLogService.log("SYSTEM_PURGE_REJECTED", currentEmail,
                    "Yêu cầu xoá dữ liệu bị từ chối. Mã lỗi: " + reason, "FAILURE");
            throw error;
        }

        auditLogService.log("SYSTEM_PURGE_STARTED", currentEmail,
                "Đã xác nhận mật khẩu và bắt đầu xoá file upload trên cloud cùng dữ liệu hệ thống. Nhật ký kiểm toán được giữ lại.", "IN_PROGRESS");
        log.warn("PURGING ALL DATA FROM SYSTEM triggered by {}...", currentEmail);
        try {
            storageService.purgeUploads();
            purgeJpaData();
            purgeMongoData();
            dataInitializer.initializeDefaults();
        } catch (RuntimeException error) {
            auditLogService.log("SYSTEM_PURGE_FAILED", currentEmail,
                    "Xoá dữ liệu hệ thống không hoàn tất. Loại lỗi: " + error.getClass().getSimpleName(), "FAILURE");
            throw error;
        }

        auditLogService.log("SYSTEM_PURGE_ALL_DATA", currentEmail,
                "Đã xoá file upload trên cloud, xoá dữ liệu hệ thống và khởi tạo lại tài khoản mặc định. Nhật ký kiểm toán được giữ lại.");
        log.info("SYSTEM PURGE COMPLETED SUCCESSFULLY.");
    }

    private void purgeJpaData() {
        log.info("Purging JPA data...");
        
        // Disable foreign key checks for MySQL
        entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS = 0").executeUpdate();

        List<String> tables = List.of(
                "goods_receipt_items",
                "goods_receipts",
                "inventory_ledgers",
                "inventory",
                "po_items",
                "purchase_orders",
                "skus",
                "suppliers",
                "user_purge_credentials",
                "user_profiles",
                "addresses",
                "users",
                "warehouses"
        );

        try {
            for (String table : tables) {
                entityManager.createNativeQuery("TRUNCATE TABLE " + table).executeUpdate();
            }
        } finally {
            entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS = 1").executeUpdate();
        }
    }

    private void purgeMongoData() {
        log.info("Purging MongoDB data...");
        String auditCollection = mongoTemplate.getCollectionName(AuditLog.class);
        for (String collectionName : mongoTemplate.getCollectionNames()) {
            if (!collectionName.startsWith("system.") && !collectionName.equals(auditCollection)) {
                mongoTemplate.dropCollection(collectionName);
            }
        }
    }
}
