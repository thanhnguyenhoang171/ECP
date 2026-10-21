package com.example.ecp_api.service.helper;

import com.example.ecp_api.dto.request.InventoryFilterRequest;
import com.example.ecp_api.entity.jpa.Inventory;
import com.example.ecp_api.util.SecurityUtils;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Locale;
import java.util.UUID;

public final class InventorySpecifications {
    private InventorySpecifications() {}

    public static Specification<Inventory> matching(InventoryFilterRequest filter) {
        return (root, query, cb) -> {
            var predicates = new ArrayList<jakarta.persistence.criteria.Predicate>();
            if (filter != null) {
                if (StringUtils.hasText(filter.getWarehouseId())) {
                    predicates.add(cb.equal(root.get("warehouse").get("id"), UUID.fromString(filter.getWarehouseId())));
                }
                if (StringUtils.hasText(filter.getSkuId())) {
                    predicates.add(cb.equal(root.get("sku").get("id"), UUID.fromString(filter.getSkuId())));
                }
                if (StringUtils.hasText(filter.getBatchCode())) {
                    predicates.add(cb.like(root.get("batchCode"), "%" + filter.getBatchCode() + "%"));
                }
                if (StringUtils.hasText(filter.getProductId())) {
                    predicates.add(cb.equal(root.get("sku").get("productId"), filter.getProductId()));
                }
                if (StringUtils.hasText(filter.getSkuCode())) {
                    predicates.add(cb.equal(root.get("sku").get("skuCode"), filter.getSkuCode()));
                }
                if (StringUtils.hasText(filter.getProductName())) {
                    predicates.add(cb.like(root.get("sku").get("productName"), "%" + filter.getProductName() + "%"));
                }
                if (StringUtils.hasText(filter.getKeyword())) {
                    String keyword = "%" + escapeLike(filter.getKeyword().trim().toLowerCase(Locale.ROOT)) + "%";
                    predicates.add(cb.or(cb.like(cb.lower(root.get("sku").get("productName")), keyword, '\\'),
                            cb.like(cb.lower(root.get("sku").get("skuCode")), keyword, '\\'),
                            cb.like(cb.lower(root.get("batchCode")), keyword, '\\')));
                }
                if (StringUtils.hasText(filter.getStockStatus())) {
                    switch (filter.getStockStatus()) {
                        case "low" -> predicates.add(cb.and(cb.greaterThan(root.get("quantityOnHand"), 0), cb.lessThanOrEqualTo(root.get("quantityOnHand"), 5)));
                        case "out" -> predicates.add(cb.equal(root.get("quantityOnHand"), 0));
                        case "ok" -> predicates.add(cb.greaterThan(root.get("quantityOnHand"), 5));
                        case "all" -> { }
                        default -> throw new IllegalArgumentException("Invalid stock status");
                    }
                }
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }

    private static String escapeLike(String value) {
        return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }
}
