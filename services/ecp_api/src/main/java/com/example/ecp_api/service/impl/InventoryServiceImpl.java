package com.example.ecp_api.service.impl;

import com.example.ecp_api.dto.request.InventoryAdjustmentRequest;
import com.example.ecp_api.dto.response.InventoryLedgerResponse;
import com.example.ecp_api.dto.response.InventoryResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.PaginationResponse;
import com.example.ecp_api.entity.jpa.Inventory;
import com.example.ecp_api.entity.jpa.InventoryLedger;
import com.example.ecp_api.entity.jpa.Sku;
import com.example.ecp_api.entity.jpa.Warehouse;
import com.example.ecp_api.enums.common.TransactionType;
import com.example.ecp_api.exception.AppException;
import com.example.ecp_api.mapper.InventoryMapper;
import com.example.ecp_api.repository.jpa.InventoryLedgerRepository;
import com.example.ecp_api.repository.jpa.InventoryRepository;
import com.example.ecp_api.repository.jpa.SkuRepository;
import com.example.ecp_api.repository.jpa.WarehouseRepository;
import com.example.ecp_api.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final InventoryLedgerRepository inventoryLedgerRepository;
    private final WarehouseRepository warehouseRepository;
    private final SkuRepository skuRepository;
    private final InventoryMapper inventoryMapper;
    private final com.example.ecp_api.service.AuditLogService auditLogService;

    @Override
    @Transactional
    public InventoryResponse adjustInventory(InventoryAdjustmentRequest request, TransactionType type, String refId, String refType) {
        UUID warehouseId = UUID.fromString(request.getWarehouseId());
        UUID skuId = UUID.fromString(request.getSkuId());
        String batchCode = request.getBatchCode();

        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new AppException("WAREHOUSE_NOT_FOUND", "Không tìm thấy kho hàng.", HttpStatus.NOT_FOUND));
        
        Sku sku = skuRepository.findById(skuId)
                .orElseThrow(() -> new AppException("SKU_NOT_FOUND", "Không tìm thấy SKU.", HttpStatus.NOT_FOUND));

        Inventory inventory = inventoryRepository.findByWarehouseIdAndSkuIdAndBatchCode(warehouseId, skuId, batchCode)
                .orElseGet(() -> Inventory.builder()
                        .warehouse(warehouse)
                        .sku(sku)
                        .batchCode(batchCode)
                        .quantityOnHand(0)
                        .quantityLocked(0)
                        .build());

        int oldBalance = inventory.getQuantityOnHand();
        int newBalance = oldBalance + request.getQuantityChange();

        if (newBalance < 0) {
            throw new AppException("INSUFFICIENT_STOCK", "Tồn kho không đủ để thực hiện giao dịch.", HttpStatus.BAD_REQUEST);
        }

        inventory.setQuantityOnHand(newBalance);
        inventory = inventoryRepository.save(inventory);

        // Ghi Ledger
        InventoryLedger ledger = InventoryLedger.builder()
                .warehouse(warehouse)
                .sku(sku)
                .batchCode(batchCode)
                .transactionType(type)
                .quantityChange(request.getQuantityChange())
                .balanceAfter(newBalance)
                .referenceId(refId)
                .referenceType(refType)
                .note(request.getNote())
                .build();
        
        inventoryLedgerRepository.save(ledger);

        auditLogService.log("INVENTORY_ADJUST", com.example.ecp_api.util.SecurityUtils.getCurrentUsername(), 
                "Adjusted stock in warehouse " + warehouse.getName() + ": SKU " + sku.getSkuCode() + " change: " + request.getQuantityChange());

        return inventoryMapper.toResponse(inventory);
    }

    @Override
    public InventoryResponse getInventoryById(String id) {
        Inventory inventory = inventoryRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new AppException("INVENTORY_NOT_FOUND", "Không tìm thấy thông tin tồn kho.", HttpStatus.NOT_FOUND));
        return inventoryMapper.toResponse(inventory);
    }

    @Override
    public PageResponse<InventoryResponse> getAllInventory(com.example.ecp_api.dto.request.InventoryFilterRequest filter, Pageable pageable) {
        org.springframework.data.jpa.domain.Specification<Inventory> spec = (root, query, cb) -> {
            java.util.List<jakarta.persistence.criteria.Predicate> predicates = new java.util.ArrayList<>();
            if (filter != null) {
                if (org.springframework.util.StringUtils.hasText(filter.getWarehouseId())) {
                    predicates.add(cb.equal(root.get("warehouse").get("id"), UUID.fromString(filter.getWarehouseId())));
                }
                if (org.springframework.util.StringUtils.hasText(filter.getSkuId())) {
                    predicates.add(cb.equal(root.get("sku").get("id"), UUID.fromString(filter.getSkuId())));
                }
                if (org.springframework.util.StringUtils.hasText(filter.getBatchCode())) {
                    predicates.add(cb.like(root.get("batchCode"), "%" + filter.getBatchCode() + "%"));
                }
                if (org.springframework.util.StringUtils.hasText(filter.getSkuCode())) {
                    predicates.add(cb.equal(root.get("sku").get("skuCode"), filter.getSkuCode()));
                }
                if (org.springframework.util.StringUtils.hasText(filter.getProductName())) {
                    predicates.add(cb.like(root.get("sku").get("productName"), "%" + filter.getProductName() + "%"));
                }
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        Page<Inventory> page = inventoryRepository.findAll(spec, pageable);
        return inventoryMapper.toPageResponse(page);
    }

    @Override
    @Transactional
    public void deleteInventory(String id) {
        Inventory inventory = inventoryRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new AppException("INVENTORY_NOT_FOUND", "Không tìm thấy thông tin tồn kho.", HttpStatus.NOT_FOUND));
        
        if (inventory.getQuantityOnHand() > 0 || inventory.getQuantityLocked() > 0) {
            throw new AppException("INVENTORY_NOT_EMPTY", "Không thể xóa bản ghi tồn kho vẫn còn số dư.", HttpStatus.BAD_REQUEST);
        }
        
        inventoryRepository.delete(inventory);

        auditLogService.log("INVENTORY_DELETE", com.example.ecp_api.util.SecurityUtils.getCurrentUsername(), 
                "Deleted inventory record " + inventory.getId() + " for SKU " + inventory.getSku().getSkuCode());
    }

    @Override
    public InventoryLedgerResponse getLedgerById(String id) {
        InventoryLedger ledger = inventoryLedgerRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new AppException("LEDGER_NOT_FOUND", "Không tìm thấy nhật ký kho.", HttpStatus.NOT_FOUND));
        return inventoryMapper.toLedgerResponse(ledger);
    }

    @Override
    public PageResponse<InventoryLedgerResponse> getAllLedgers(com.example.ecp_api.dto.request.InventoryLedgerFilterRequest filter, Pageable pageable) {
        org.springframework.data.jpa.domain.Specification<InventoryLedger> spec = (root, query, cb) -> {
            java.util.List<jakarta.persistence.criteria.Predicate> predicates = new java.util.ArrayList<>();
            if (filter != null) {
                if (org.springframework.util.StringUtils.hasText(filter.getWarehouseId())) {
                    predicates.add(cb.equal(root.get("warehouse").get("id"), UUID.fromString(filter.getWarehouseId())));
                }
                if (org.springframework.util.StringUtils.hasText(filter.getSkuId())) {
                    predicates.add(cb.equal(root.get("sku").get("id"), UUID.fromString(filter.getSkuId())));
                }
                if (org.springframework.util.StringUtils.hasText(filter.getBatchCode())) {
                    predicates.add(cb.equal(root.get("batchCode"), filter.getBatchCode()));
                }
                if (filter.getTransactionType() != null) {
                    predicates.add(cb.equal(root.get("transactionType"), filter.getTransactionType()));
                }
                if (filter.getFromDate() != null) {
                    predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), filter.getFromDate()));
                }
                if (filter.getToDate() != null) {
                    predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), filter.getToDate()));
                }
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        Page<InventoryLedger> page = inventoryLedgerRepository.findAll(spec, pageable);
        
        PaginationResponse pagination = PaginationResponse.builder()
                .currentPage(page.getNumber() + 1)
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .pageSize(page.getSize())
                .isLast(page.isLast())
                .isFirst(page.isFirst())
                .build();

        return PageResponse.<InventoryLedgerResponse>builder()
                .success(true)
                .code("LEDGER_LIST_FETCHED")
                .message("Fetch ledgers successfully")
                .data(inventoryMapper.toLedgerResponseList(page.getContent()))
                .pagination(pagination)
                .build();
    }

    @Override
    public List<InventoryLedgerResponse> getHistory(String warehouseId, String skuId, String batchCode) {
        List<InventoryLedger> ledgers = inventoryLedgerRepository.findByWarehouseIdAndSkuIdAndBatchCodeOrderByCreatedAtDesc(
                UUID.fromString(warehouseId), UUID.fromString(skuId), batchCode);
        return inventoryMapper.toLedgerResponseList(ledgers);
    }
}
