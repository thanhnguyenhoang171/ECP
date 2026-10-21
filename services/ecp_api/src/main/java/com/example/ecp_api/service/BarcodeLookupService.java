package com.example.ecp_api.service;

import com.example.ecp_api.dto.request.InventoryFilterRequest;
import com.example.ecp_api.dto.response.BarcodeLookupResponse;
import com.example.ecp_api.entity.mongodb.Product;
import com.example.ecp_api.entity.mongodb.embedded.ProductVariant;
import com.example.ecp_api.exception.AppException;
import com.example.ecp_api.mapper.InventoryMapper;
import com.example.ecp_api.mapper.SkuMapper;
import com.example.ecp_api.repository.jpa.InventoryRepository;
import com.example.ecp_api.repository.jpa.SkuRepository;
import com.example.ecp_api.repository.jpa.WarehouseRepository;
import com.example.ecp_api.service.helper.InventorySpecifications;
import com.example.ecp_api.util.SecurityUtils;
import com.example.ecp_api.security.DataOwnership;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BarcodeLookupService {
    private final SkuRepository skus;
    private final WarehouseRepository warehouses;
    private final InventoryRepository inventory;
    private final SkuMapper skuMapper;
    private final InventoryMapper inventoryMapper;
    private final MongoTemplate mongo;

    @Transactional(readOnly = true)
    public BarcodeLookupResponse lookup(String input, UUID warehouseId) {
        // Keep leading zeroes: barcodes are identifiers, never numbers.
        String code = input == null ? "" : input.trim();
        if (code.isEmpty() || code.length() > 128 || code.chars().anyMatch(Character::isISOControl)) {
            throw new AppException("INVALID_BARCODE", "Mã vạch/SKU phải có từ 1 đến 128 ký tự hợp lệ.", HttpStatus.BAD_REQUEST);
        }
        if (warehouseId != null) {
            var warehouse = warehouses.findById(warehouseId).filter(value -> value.getDeletedAt() == null).orElseThrow(() ->
                    new AppException("WAREHOUSE_NOT_FOUND", "Không tìm thấy kho hàng.", HttpStatus.NOT_FOUND));
            DataOwnership.require(warehouse.getCreatedBy());
        }
        var matches = skus.findAll(DataOwnership.skus(mongo).and((root, query, cb) -> cb.or(cb.equal(root.get("barcode"), code), cb.equal(root.get("skuCode"), code))));
        if (matches.isEmpty()) {
            throw new AppException("BARCODE_NOT_FOUND", "Không tìm thấy hàng hoá có mã này. Hãy kiểm tra mã vạch của biến thể sản phẩm.", HttpStatus.NOT_FOUND);
        }
        if (matches.size() > 1) {
            throw new AppException("BARCODE_AMBIGUOUS", "Mã trùng giữa barcode và SKU của các mặt hàng khác nhau. Hãy sửa mã trước khi nhập kho.", HttpStatus.CONFLICT);
        }
        var sku = matches.getFirst();
        Product product = mongo.findById(sku.getProductId(), Product.class);
        if (product == null || product.isDeleted()) {
            throw new AppException("PRODUCT_NOT_FOUND", "Sản phẩm của SKU này không còn tồn tại.", HttpStatus.NOT_FOUND);
        }
        DataOwnership.require(product.getCreatedBy());
        ProductVariant variant = product.getVariants() == null ? null : product.getVariants().stream()
                .filter(item -> sku.getId().toString().equals(item.getSku_id()) || sku.getSkuCode().equals(item.getSku()))
                .findFirst().orElse(null);
        var skuResponse = skuMapper.toAdminResponse(sku);
        skuResponse.setProductName(product.getName());
        skuResponse.setActive(sku.isActive() && (variant == null || variant.isActive()));
        BigDecimal cost = variant == null || variant.getCostPrice() == null ? BigDecimal.ZERO : variant.getCostPrice();
        BigDecimal price = variant == null || variant.getPrice() == null ? BigDecimal.ZERO : variant.getPrice();
        var filter = new InventoryFilterRequest();
        filter.setSkuId(sku.getId().toString());
        if (warehouseId != null) { filter.setWarehouseId(warehouseId.toString()); }
        // Reuse the same warehouse ownership scope as the inventory list/export.
        var rows = inventory.findAll(InventorySpecifications.matching(filter).and(DataOwnership.stock(mongo)), Sort.by("warehouse.name", "batchCode", "id"));
        long onHand = rows.stream().mapToLong(row -> row.getQuantityOnHand()).sum();
        long locked = rows.stream().mapToLong(row -> row.getQuantityLocked()).sum();
        var stocks = inventoryMapper.toResponseList(rows);
        stocks.forEach(row -> { row.setCostPrice(cost); row.setPrice(price); row.setSellingPrice(price); });
        return new BarcodeLookupResponse(skuResponse, cost, price, onHand, locked, onHand - locked, stocks);
    }
}
