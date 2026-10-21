package com.example.ecp_api.security;

import com.example.ecp_api.entity.jpa.*;
import com.example.ecp_api.entity.mongodb.Product;
import com.example.ecp_api.exception.AppException;
import com.example.ecp_api.util.SecurityUtils;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpStatus;
import org.springframework.util.StringUtils;
import java.util.List;

/** Management data belongs to its original creator. Updating a record never transfers ownership. */
public final class DataOwnership {
    private DataOwnership() {}
    public static boolean restricted() { return SecurityUtils.isManager() && !SecurityUtils.isSuperAdmin(); }
    public static boolean visible(String creator) {
        return !restricted() || (StringUtils.hasText(creator) && emailOf(creator).equalsIgnoreCase(SecurityUtils.getCurrentUserEmail()));
    }
    public static String emailOf(String value) {
        if (value == null) { return ""; }
        value = value.trim();
        if (value.startsWith("{")) {
            try { return new com.fasterxml.jackson.databind.ObjectMapper().readTree(value).path("email").asText(""); }
            catch (com.fasterxml.jackson.core.JsonProcessingException error) { return ""; }
        }
        return value;
    }
    private static jakarta.persistence.criteria.Predicate ownerPredicate(jakarta.persistence.criteria.Expression<String> owner,
            jakarta.persistence.criteria.CriteriaBuilder cb) {
        String email = SecurityUtils.getCurrentUserEmail().replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
        return cb.or(cb.equal(owner, SecurityUtils.getCurrentUserEmail()), cb.like(owner, "%\"email\":\"" + email + "\"%", '\\'));
    }
    public static void require(String creator) {
        if (!visible(creator)) { throw new AppException("DATA_ACCESS_DENIED", "Bạn chỉ được truy cập dữ liệu do chính mình tạo.", HttpStatus.FORBIDDEN); }
    }
    public static java.util.regex.Pattern legacyOwnerPattern() {
        return java.util.regex.Pattern.compile("^\\s*\\{.*\"email\"\\s*:\\s*\"" + java.util.regex.Pattern.quote(SecurityUtils.getCurrentUserEmail()) + "\".*\\}\\s*$", java.util.regex.Pattern.CASE_INSENSITIVE);
    }
    public static Query mongo(Query query) {
        if (restricted()) { query.addCriteria(Criteria.where("createdBy").in(SecurityUtils.getCurrentUserEmail(), legacyOwnerPattern())); }
        return query;
    }
    public static <T> Specification<T> sql() {
        return (root, query, cb) -> cb.and(cb.isNull(root.get("deletedAt")), restricted() ? ownerPredicate(root.get("createdBy"), cb) : cb.conjunction());
    }
    public static List<String> productIds(MongoTemplate mongo) {
        return mongo.findDistinct(mongo(Query.query(Criteria.where("is_deleted").ne(true))), "_id", Product.class, String.class);
    }
    public static Specification<Sku> skus(MongoTemplate mongo) {
        List<String> ids = productIds(mongo);
        return (root, query, cb) -> root.get("productId").in(ids);
    }
    public static void requireSku(Sku sku, MongoTemplate mongo) {
        Product product = mongo.findById(sku.getProductId(), Product.class);
        if (product == null) { throw new AppException("SKU_NOT_FOUND", "Không tìm thấy SKU trong dữ liệu của bạn.", HttpStatus.NOT_FOUND); }
        if (product.isDeleted()) { throw new AppException("PRODUCT_DELETED", "Sản phẩm đã bị xoá mềm.", HttpStatus.CONFLICT); }
        require(product.getCreatedBy());
    }
    public static <T> Specification<T> stock(MongoTemplate mongo) {
        List<String> ids = restricted() ? mongo.findDistinct(mongo(new Query()), "_id", Product.class, String.class) : List.of();
        return (root, query, cb) -> restricted() ? cb.and(
                ownerPredicate(root.get("warehouse").get("createdBy"), cb),
                root.get("sku").get("productId").in(ids)) : cb.conjunction();
    }
    public static Specification<PurchaseOrder> orders(MongoTemplate mongo) {
        List<String> ids = restricted() ? productIds(mongo) : List.of();
        return (root, query, cb) -> {
            if (!restricted()) { return cb.isNull(root.get("deletedAt")); }
            var invalid = query.subquery(java.util.UUID.class);
            var item = invalid.correlate(root).join("items");
            invalid.select(item.get("id")).where(cb.not(item.get("sku").get("productId").in(ids)));
            return cb.and(cb.isNull(root.get("deletedAt")), ownerPredicate(root.get("createdBy"), cb), ownerPredicate(root.get("warehouse").get("createdBy"), cb),
                    ownerPredicate(root.get("supplier").get("createdBy"), cb), cb.not(cb.exists(invalid)));
        };
    }
    public static Specification<GoodsReceipt> receipts(MongoTemplate mongo) {
        List<String> ids = restricted() ? productIds(mongo) : List.of();
        return (root, query, cb) -> {
            if (!restricted()) { return cb.isNull(root.get("deletedAt")); }
            var invalid = query.subquery(java.util.UUID.class);
            var item = invalid.correlate(root).join("items");
            invalid.select(item.get("id")).where(cb.not(item.get("sku").get("productId").in(ids)));
            var order = root.join("purchaseOrder", jakarta.persistence.criteria.JoinType.LEFT);
            var supplier = order.join("supplier", jakarta.persistence.criteria.JoinType.LEFT);
            return cb.and(cb.isNull(root.get("deletedAt")), ownerPredicate(root.get("createdBy"), cb), ownerPredicate(root.get("warehouse").get("createdBy"), cb),
                    cb.or(cb.isNull(order.get("id")), cb.and(ownerPredicate(order.get("createdBy"), cb), ownerPredicate(supplier.get("createdBy"), cb))), cb.not(cb.exists(invalid)));
        };
    }
    public static void requireOrder(PurchaseOrder order, MongoTemplate mongo) {
        if (order.getDeletedAt() != null) { throw new AppException("RECORD_DELETED", "Đơn mua hàng đã bị xoá mềm.", HttpStatus.CONFLICT); }
        require(order.getCreatedBy());
        if (!restricted()) { return; }
        if (order.getWarehouse() == null || order.getSupplier() == null) { require(null); }
        require(order.getWarehouse().getCreatedBy()); require(order.getSupplier().getCreatedBy());
        order.getItems().forEach(item -> requireSku(item.getSku(), mongo));
    }
    public static void requireReceipt(GoodsReceipt receipt, MongoTemplate mongo) {
        if (receipt.getDeletedAt() != null) { throw new AppException("RECORD_DELETED", "Phiếu nhập đã bị xoá mềm.", HttpStatus.CONFLICT); }
        require(receipt.getCreatedBy());
        if (!restricted()) { return; }
        if (receipt.getWarehouse() == null) { require(null); }
        require(receipt.getWarehouse().getCreatedBy());
        receipt.getItems().forEach(item -> requireSku(item.getSku(), mongo));
        if (receipt.getPurchaseOrder() != null) { requireOrder(receipt.getPurchaseOrder(), mongo); }
    }
    public static void requireSkuHistory(Sku sku, MongoTemplate mongo) {
        if (!restricted()) { return; }
        Product product = mongo.findById(sku.getProductId(), Product.class);
        if (product == null) { throw new AppException("SKU_NOT_FOUND", "Không tìm thấy sản phẩm.", HttpStatus.NOT_FOUND); }
        require(product.getCreatedBy());
    }
    public static void requireStock(Inventory stock, MongoTemplate mongo) {
        require(stock.getWarehouse().getCreatedBy()); requireSkuHistory(stock.getSku(), mongo);
    }
}
