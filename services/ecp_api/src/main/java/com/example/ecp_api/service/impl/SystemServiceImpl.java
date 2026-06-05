package com.example.ecp_api.service.impl;

import com.example.ecp_api.config.DataInitializer;
import com.example.ecp_api.service.AuditLogService;
import com.example.ecp_api.service.SystemService;
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

    private final MongoTemplate mongoTemplate;
    private final DataInitializer dataInitializer;
    private final AuditLogService auditLogService;

    @Override
    @Transactional
    public void purgeAllData() {
        String currentUsername = com.example.ecp_api.util.SecurityUtils.getCurrentUsername();
        log.warn("PURGING ALL DATA FROM SYSTEM triggered by {}...", currentUsername);

        // Purge MySQL Data
        purgeJpaData();

        // Purge MongoDB Data
        purgeMongoData();

        // Re-initialize default accounts
        dataInitializer.initializeDefaults();

        // Log the high-impact action
        auditLogService.logAction(
                "PURGE_ALL_DATA",
                currentUsername,
                "SYSTEM",
                "ALL",
                "Permanently purged all system data and re-initialized default accounts."
        );

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
                "user_profiles",
                "addresses",
                "users",
                "warehouses"
        );

        for (String table : tables) {
            entityManager.createNativeQuery("TRUNCATE TABLE " + table).executeUpdate();
        }

        // Re-enable foreign key checks
        entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS = 1").executeUpdate();
    }

    private void purgeMongoData() {
        log.info("Purging MongoDB data...");
        for (String collectionName : mongoTemplate.getCollectionNames()) {
            if (!collectionName.startsWith("system.")) {
                mongoTemplate.dropCollection(collectionName);
            }
        }
    }
}
