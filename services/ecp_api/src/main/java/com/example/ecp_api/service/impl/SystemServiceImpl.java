package com.example.ecp_api.service.impl;

import com.example.ecp_api.service.AuditLogService;
import com.example.ecp_api.service.SystemService;
import com.example.ecp_api.service.StorageService;
import com.example.ecp_api.service.PurgePasswordService;
import com.example.ecp_api.entity.mongodb.Product;
import com.example.ecp_api.entity.mongodb.Category;
import com.example.ecp_api.entity.mongodb.Brand;
import org.springframework.data.mongodb.core.query.Query;
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
    private final AuditLogService auditLogService;
    private final StorageService storageService;

    @Override
    @Transactional
    public void purgeAllData(String password) {
        if (com.example.ecp_api.security.DataOwnership.restricted()) {
            throw new AppException("FORBIDDEN", "Chỉ Super Admin được phép purge dữ liệu toàn hệ thống.", org.springframework.http.HttpStatus.FORBIDDEN);
        }
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
                "Đã xác nhận mật khẩu và bắt đầu xoá sản phẩm, danh mục, thương hiệu, kho hàng và media tương ứng. Giữ nguyên tài khoản, phân quyền, phiên đăng nhập và nhật ký kiểm toán.", "IN_PROGRESS");
        log.warn("PURGING CATALOG AND INVENTORY DATA triggered by {}...", currentEmail);
        try {
            storageService.purgeBusinessUploads();
            purgeJpaData();
            purgeMongoData();
        } catch (RuntimeException error) {
            auditLogService.log("SYSTEM_PURGE_FAILED", currentEmail,
                    "Xoá dữ liệu sản phẩm và kho hàng không hoàn tất. Loại lỗi: " + error.getClass().getSimpleName(), "FAILURE");
            throw error;
        }

        auditLogService.log("SYSTEM_PURGE_ALL_DATA", currentEmail,
                "Đã xoá sản phẩm, danh mục, thương hiệu, dữ liệu kho hàng và media tương ứng. Tài khoản, phân quyền, phiên đăng nhập và nhật ký kiểm toán được giữ nguyên.");
        log.info("SYSTEM PURGE COMPLETED SUCCESSFULLY.");
    }

    private void purgeJpaData() {
        // Child tables first. DELETE participates in the SQL transaction and keeps
        // foreign-key checks enabled; account/access/session tables are never touched.
        List<String> tables = List.of(
                "goods_receipt_items", "goods_receipts", "inventory_ledgers", "inventory",
                "po_items", "purchase_orders", "skus", "suppliers", "warehouses"
        );
        for (String table : tables) {
            entityManager.createNativeQuery("DELETE FROM " + table).executeUpdate();
        }
    }

    private void purgeMongoData() {
        // Explicit collection allowlist. Preserve audit logs, unrelated collections
        // and the indexes/validators on the collections being emptied.
        mongoTemplate.remove(new Query(), Product.class);
        mongoTemplate.remove(new Query(), Category.class);
        mongoTemplate.remove(new Query(), Brand.class);
    }
}
