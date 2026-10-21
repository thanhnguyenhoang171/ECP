package com.example.ecp_api.service;

import com.example.ecp_api.dto.response.*;
import com.example.ecp_api.entity.mongodb.*;
import com.example.ecp_api.entity.jpa.*;
import com.example.ecp_api.exception.AppException;
import com.example.ecp_api.repository.jpa.*;
import com.example.ecp_api.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class RecordRecoveryService {
    public record DeletedRecord(String id, String label, String createdBy, String updatedBy, String deletedBy,
                                LocalDateTime createdAt, LocalDateTime updatedAt, LocalDateTime deletedAt) {}
    private final MongoTemplate mongo;
    private final SupplierRepository suppliers;
    private final WarehouseRepository warehouses;
    private final PurchaseOrderRepository orders;
    private final GoodsReceiptRepository receipts;
    private final UserRepository users;
    private final AuditLogService audit;

    @Transactional(readOnly = true)
    public PageResponse<DeletedRecord> list(String module, Pageable requested) {
        requireAdmin();
        Pageable pageable = PageRequest.of(requested.getPageNumber(), Math.min(100, requested.getPageSize()), Sort.by(Sort.Direction.DESC, "deletedAt", "id"));
        Page<DeletedRecord> page = switch (module) {
            case "products" -> mongoPage(Product.class, pageable).map(value -> row(value.getId(), value.getName(), value.getCreatedBy(), value.getUpdatedBy(), value.getDeletedBy(), value.getCreatedAt(), value.getUpdatedAt(), value.getDeletedAt()));
            case "brands" -> mongoPage(Brand.class, pageable).map(value -> row(value.getId(), value.getName(), value.getCreatedBy(), value.getUpdatedBy(), value.getDeletedBy(), value.getCreatedAt(), value.getUpdatedAt(), value.getDeletedAt()));
            case "categories" -> mongoPage(Category.class, pageable).map(value -> row(value.getId(), value.getName(), value.getCreatedBy(), value.getUpdatedBy(), value.getDeletedBy(), value.getCreatedAt(), value.getUpdatedAt(), value.getDeletedAt()));
            case "suppliers" -> suppliers.findAll(deleted(), pageable).map(value -> row(value.getId().toString(), value.getName(), value.getCreatedBy(), value.getUpdatedBy(), value.getDeletedBy(), value.getCreatedAt(), value.getUpdatedAt(), value.getDeletedAt()));
            case "warehouses" -> warehouses.findAll(deleted(), pageable).map(value -> row(value.getId().toString(), value.getName(), value.getCreatedBy(), value.getUpdatedBy(), value.getDeletedBy(), value.getCreatedAt(), value.getUpdatedAt(), value.getDeletedAt()));
            case "purchase-orders" -> orders.findAll(deleted(), pageable).map(value -> row(value.getId().toString(), value.getPoCode(), value.getCreatedBy(), value.getUpdatedBy(), value.getDeletedBy(), value.getCreatedAt(), value.getUpdatedAt(), value.getDeletedAt()));
            case "goods-receipt" -> receipts.findAll(deleted(), pageable).map(value -> row(value.getId().toString(), value.getReceiptCode(), value.getCreatedBy(), value.getUpdatedBy(), value.getDeletedBy(), value.getCreatedAt(), null, value.getDeletedAt()));
            case "users" -> users.findAll(deleted(), pageable).map(value -> row(value.getId().toString(), value.getEmail(), actor(value.getCreatedBy()), actor(value.getUpdatedBy()), actor(value.getDeletedBy()), value.getCreatedAt(), value.getUpdatedAt(), value.getDeletedAt()));
            default -> throw invalidModule();
        };
        return PageResponse.<DeletedRecord>builder().success(true).data(page.getContent()).pagination(PaginationResponse.builder()
                .currentPage(page.getNumber() + 1).pageSize(page.getSize()).totalPages(page.getTotalPages()).totalElements(page.getTotalElements()).isFirst(page.isFirst()).isLast(page.isLast()).build()).build();
    }

    @Transactional
    public void restore(String module, String id) {
        requireAdmin();
        switch (module) {
            case "products" -> {
                Product value = find(id, Product.class); requireDeleted(value.isDeleted());
                if (value.getCategoryId() != null) { requireAvailableCategory(value.getCategoryId()); }
                if (value.getBrandId() != null) { requireAvailableBrand(value.getBrandId()); }
                ensureUniqueSlug(Product.class, id, value.getSlug());
                value.setDeleted(false); value.setDeletedAt(null); value.setPublished(true); value.setUpdatedBy(SecurityUtils.getCurrentUserEmail()); mongo.save(value);
            }
            case "brands" -> {
                Brand value = find(id, Brand.class); requireDeleted(value.isDeleted()); ensureUniqueSlug(Brand.class, id, value.getSlug());
                value.setDeleted(false); value.setDeletedAt(null); value.setActive(true); value.setUpdatedBy(SecurityUtils.getCurrentUserEmail()); mongo.save(value);
            }
            case "categories" -> {
                Category value = find(id, Category.class); requireDeleted(value.isDeleted()); ensureUniqueSlug(Category.class, id, value.getSlug());
                if (value.getParentId() != null && !value.getParentId().isBlank()) { requireAvailableCategory(value.getParentId()); }
                value.setDeleted(false); value.setDeletedAt(null); value.setActive(true); value.setUpdatedBy(SecurityUtils.getCurrentUserEmail()); mongo.save(value);
            }
            case "suppliers" -> {
                Supplier value = suppliers.findById(uuid(id)).orElseThrow(this::notFound); requireDeleted(value.getDeletedAt() != null);
                value.setDeletedAt(null); value.setActive(true); value.setUpdatedBy(SecurityUtils.getCurrentUserEmail()); suppliers.save(value);
            }
            case "warehouses" -> {
                Warehouse value = warehouses.findById(uuid(id)).orElseThrow(this::notFound); requireDeleted(value.getDeletedAt() != null);
                value.setDeletedAt(null); value.setActive(true); value.setUpdatedBy(SecurityUtils.getCurrentUserEmail()); warehouses.save(value);
            }
            case "purchase-orders" -> {
                PurchaseOrder value = orders.findForUpdate(uuid(id)).orElseThrow(this::notFound); requireDeleted(value.getDeletedAt() != null);
                requireWarehouse(value.getWarehouse());
                if (value.getSupplier() == null || value.getSupplier().getDeletedAt() != null || !value.getSupplier().isActive()) { throw dependency(); }
                value.setDeletedAt(null); value.setUpdatedBy(SecurityUtils.getCurrentUserEmail()); orders.save(value);
            }
            case "goods-receipt" -> {
                GoodsReceipt value = receipts.findForUpdate(uuid(id)).orElseThrow(this::notFound); requireDeleted(value.getDeletedAt() != null);
                requireWarehouse(value.getWarehouse());
                if (value.getPurchaseOrder() != null && value.getPurchaseOrder().getDeletedAt() != null) { throw dependency(); }
                value.setDeletedAt(null); value.setUpdatedBy(SecurityUtils.getCurrentUserEmail()); receipts.save(value);
            }
            case "users" -> {
                User value = users.findById(uuid(id)).orElseThrow(this::notFound); requireDeleted(value.getDeletedAt() != null);
                value.setDeletedAt(null); value.setActive(true);
                value.setUpdatedBy(users.findByEmail(SecurityUtils.getCurrentUserEmail()).orElseThrow(this::notFound)); users.save(value);
            }
            default -> throw invalidModule();
        }
        String actor = SecurityUtils.getCurrentUserEmail();
        Runnable writeAudit = () -> audit.log("RECORD_RESTORE", actor, "Restored " + module + "/" + id);
        if (org.springframework.transaction.support.TransactionSynchronizationManager.isSynchronizationActive()) {
            org.springframework.transaction.support.TransactionSynchronizationManager.registerSynchronization(
                    new org.springframework.transaction.support.TransactionSynchronization() {
                        @Override public void afterCommit() { writeAudit.run(); }
                    });
        } else { writeAudit.run(); }
    }

    private <T> Page<T> mongoPage(Class<T> type, Pageable pageable) {
        Query query = Query.query(Criteria.where("is_deleted").is(true));
        long count = mongo.count(query, type);
        return new PageImpl<>(mongo.find(query.with(pageable), type), pageable, count);
    }
    private <T> Specification<T> deleted() { return (root, query, cb) -> cb.isNotNull(root.get("deletedAt")); }
    private DeletedRecord row(String id, String label, String created, String updated, String removed, LocalDateTime createdAt, LocalDateTime updatedAt, LocalDateTime deletedAt) {
        return new DeletedRecord(id, label, created, updated, removed, createdAt, updatedAt, deletedAt);
    }
    private String actor(User user) { return user == null ? null : user.getEmail(); }
    private UUID uuid(String value) {
        try { return UUID.fromString(value); } catch (IllegalArgumentException error) { throw notFound(); }
    }
    private <T> T find(String id, Class<T> type) { T value = mongo.findById(id, type); if (value == null) { throw notFound(); } return value; }
    private void ensureUniqueSlug(Class<?> type, String id, String slug) {
        if (slug != null && mongo.exists(Query.query(Criteria.where("slug").is(slug).and("_id").ne(id).and("is_deleted").ne(true)), type)) {
            throw new AppException("RESTORE_CONFLICT", "Đường dẫn đã được dùng bởi bản ghi khác. Hãy xử lý bản ghi trùng trước khi khôi phục.", HttpStatus.CONFLICT);
        }
    }
    private void requireAvailableCategory(String id) { if (find(id, Category.class).isDeleted()) { throw dependency(); } }
    private void requireAvailableBrand(String id) { if (find(id, Brand.class).isDeleted()) { throw dependency(); } }
    private void requireWarehouse(Warehouse warehouse) { if (warehouse == null || warehouse.getDeletedAt() != null || !warehouse.isActive()) { throw dependency(); } }
    private void requireDeleted(boolean deleted) { if (!deleted) { throw new AppException("RECORD_NOT_DELETED", "Bản ghi này chưa bị xoá mềm.", HttpStatus.CONFLICT); } }
    private void requireAdmin() { if (!SecurityUtils.isSuperAdmin()) { throw new AppException("DATA_ACCESS_DENIED", "Chỉ Super Admin được xem và khôi phục dữ liệu đã xoá.", HttpStatus.FORBIDDEN); } }
    private AppException notFound() { return new AppException("RECORD_NOT_FOUND", "Không tìm thấy bản ghi.", HttpStatus.NOT_FOUND); }
    private AppException invalidModule() { return new AppException("INVALID_MODULE", "Phân hệ không hỗ trợ khôi phục.", HttpStatus.BAD_REQUEST); }
    private AppException dependency() { return new AppException("RESTORE_DEPENDENCY", "Hãy khôi phục và kích hoạt dữ liệu liên quan trước.", HttpStatus.CONFLICT); }
}
