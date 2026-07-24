package com.example.ecp_api.service.impl;

import com.example.ecp_api.dto.request.GoodsReceiptRequest;
import com.example.ecp_api.dto.request.InventoryAdjustmentRequest;
import com.example.ecp_api.dto.response.GoodsReceiptResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.entity.jpa.*;
import com.example.ecp_api.enums.common.PurchaseOrderStatus;
import com.example.ecp_api.enums.common.ReceiptStatus;
import com.example.ecp_api.enums.common.TransactionType;
import com.example.ecp_api.exception.AppException;
import com.example.ecp_api.mapper.GoodsReceiptMapper;
import com.example.ecp_api.repository.jpa.*;
import com.example.ecp_api.service.AuditLogService;
import com.example.ecp_api.service.GoodsReceiptService;
import com.example.ecp_api.service.InventoryService;
import com.example.ecp_api.service.helper.GoodsReceiptHelper;
import com.example.ecp_api.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GoodsReceiptServiceImpl implements GoodsReceiptService {

    private final GoodsReceiptRepository goodsReceiptRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final WarehouseRepository warehouseRepository;
    private final GoodsReceiptHelper goodsReceiptHelper;
    private final PurchaseOrderItemRepository purchaseOrderItemRepository;
    private final AuditLogService auditLogService;
    private final InventoryService inventoryService;
    private final com.example.ecp_api.service.ProductService productService;
    private final GoodsReceiptMapper goodsReceiptMapper;


    @Override
    @Transactional
    public GoodsReceiptResponse createGoodsReceipt(GoodsReceiptRequest request) {
        if (!StringUtils.hasText(request.getReceiptCode())) {
            request.setReceiptCode("GR-" + System.currentTimeMillis());
        }

        if (goodsReceiptRepository.existsByReceiptCode(request.getReceiptCode())) {
            throw new AppException("RECEIPT_CODE_EXISTS", "Mã phiếu nhập đã tồn tại.", HttpStatus.BAD_REQUEST);
        }

        GoodsReceipt receipt = goodsReceiptMapper.toEntity(request);

        if (StringUtils.hasText(request.getPurchaseOrderId())) {
            PurchaseOrder po = purchaseOrderRepository.findById(UUID.fromString(request.getPurchaseOrderId()))
                    .orElseThrow(() -> new AppException("PO_NOT_FOUND", "Không tìm thấy đơn mua hàng.", HttpStatus.NOT_FOUND));
            receipt.setPurchaseOrder(po);
        }

        Warehouse warehouse = warehouseRepository.findById(UUID.fromString(request.getWarehouseId()))
                .orElseThrow(() -> new AppException("WAREHOUSE_NOT_FOUND", "Không tìm thấy kho hàng.", HttpStatus.NOT_FOUND));
        receipt.setWarehouse(warehouse);

        goodsReceiptHelper.processGoodsReceiptItems(request, receipt);

        receipt = goodsReceiptRepository.save(receipt);

        auditLogService.log("CREATE_GOODS_RECEIPT", SecurityUtils.getCurrentUsername(), 
                "Created Goods Receipt: " + receipt.getReceiptCode());

        return goodsReceiptMapper.toResponse(receipt);
    }

    @Override
    @Transactional
    public GoodsReceiptResponse updateGoodsReceipt(String id, GoodsReceiptRequest request) {
        GoodsReceipt receipt = goodsReceiptRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new AppException("RECEIPT_NOT_FOUND", "Không tìm thấy phiếu nhập.", HttpStatus.NOT_FOUND));

        if (receipt.getStatus() != ReceiptStatus.DRAFT) {
            throw new AppException("INVALID_STATUS", "Chỉ có thể cập nhật phiếu ở trạng thái DRAFT.", HttpStatus.BAD_REQUEST);
        }

        goodsReceiptMapper.updateEntityFromRequest(request, receipt);

        if (StringUtils.hasText(request.getPurchaseOrderId())) {
            PurchaseOrder po = purchaseOrderRepository.findById(UUID.fromString(request.getPurchaseOrderId()))
                    .orElseThrow(() -> new AppException("PO_NOT_FOUND", "Không tìm thấy đơn mua hàng.", HttpStatus.NOT_FOUND));
            receipt.setPurchaseOrder(po);
        }

        Warehouse warehouse = warehouseRepository.findById(UUID.fromString(request.getWarehouseId()))
                .orElseThrow(() -> new AppException("WAREHOUSE_NOT_FOUND", "Không tìm thấy kho hàng.", HttpStatus.NOT_FOUND));
        receipt.setWarehouse(warehouse);

        goodsReceiptHelper.processGoodsReceiptItems(request, receipt);

        receipt = goodsReceiptRepository.save(receipt);
        return goodsReceiptMapper.toResponse(receipt);
    }

    @Override
    @Transactional(readOnly = true)
    public GoodsReceiptResponse getGoodsReceiptById(String id) {
        GoodsReceipt receipt = goodsReceiptRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new AppException("RECEIPT_NOT_FOUND", "Không tìm thấy phiếu nhập.", HttpStatus.NOT_FOUND));
        return goodsReceiptMapper.toResponse(receipt);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<GoodsReceiptResponse> getAllGoodsReceipts(com.example.ecp_api.dto.request.GoodsReceiptFilterRequest filter, Pageable pageable) {
        org.springframework.data.jpa.domain.Specification<GoodsReceipt> spec = (root, query, cb) -> {
            java.util.List<jakarta.persistence.criteria.Predicate> predicates = new java.util.ArrayList<>();
            if (filter != null) {
                if (org.springframework.util.StringUtils.hasText(filter.getReceiptCode())) {
                    predicates.add(cb.like(root.get("receiptCode"), "%" + filter.getReceiptCode() + "%"));
                }
                if (org.springframework.util.StringUtils.hasText(filter.getPurchaseOrderId())) {
                    predicates.add(cb.equal(root.get("purchaseOrder").get("id"), UUID.fromString(filter.getPurchaseOrderId())));
                }
                if (org.springframework.util.StringUtils.hasText(filter.getWarehouseId())) {
                    predicates.add(cb.equal(root.get("warehouse").get("id"), UUID.fromString(filter.getWarehouseId())));
                }
                if (filter.getStatus() != null) {
                    predicates.add(cb.equal(root.get("status"), filter.getStatus()));
                }
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        Page<GoodsReceipt> page = goodsReceiptRepository.findAll(spec, pageable);
        return goodsReceiptMapper.toPageResponse(page);
    }

    @Override
    @Transactional
    public void deleteGoodsReceipt(String id) {
        GoodsReceipt receipt = goodsReceiptRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new AppException("RECEIPT_NOT_FOUND", "Không tìm thấy phiếu nhập.", HttpStatus.NOT_FOUND));
        
        if (receipt.getStatus() == ReceiptStatus.RECEIVED) {
            throw new AppException("INVALID_STATUS", "Không thể xóa phiếu đã nhập kho.", HttpStatus.BAD_REQUEST);
        }

        goodsReceiptRepository.delete(receipt);
        auditLogService.log("DELETE_GOODS_RECEIPT", SecurityUtils.getCurrentUsername(), 
                "Deleted Goods Receipt: " + receipt.getReceiptCode());
    }

    @Override
    @Transactional
    public GoodsReceiptResponse confirmReceipt(String id) {
        GoodsReceipt receipt = goodsReceiptRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new AppException("RECEIPT_NOT_FOUND", "Không tìm thấy phiếu nhập.", HttpStatus.NOT_FOUND));

        if (receipt.getStatus() != ReceiptStatus.DRAFT) {
            throw new AppException("INVALID_STATUS", "Phiếu nhập đã được xử lý trước đó.", HttpStatus.BAD_REQUEST);
        }

        // Change status
        receipt.setStatus(ReceiptStatus.RECEIVED);
        receipt.setReceivedAt(LocalDateTime.now());

        // Add to inventory
        List<GoodsReceiptItem> items = receipt.getItems();

        // Repeat through each item to add it to inventory
        for (GoodsReceiptItem item : items) {
            InventoryAdjustmentRequest adjustmentRequest = InventoryAdjustmentRequest.builder()
                    .warehouseId(receipt.getWarehouse().getId().toString())
                    .skuId(item.getSku().getId().toString())
                    .batchCode(item.getBatchCode())
                    .manufactureDate(item.getManufactureDate())
                    .expiryDate(item.getExpiryDate())
                    .quantityChange(item.getQuantity())
                    .note("Receive goods from receipt: " + receipt.getReceiptCode())
                    .build();

            inventoryService.adjustInventory(
                    adjustmentRequest,
                    TransactionType.PURCHASE_RECEIPT,
                    receipt.getId().toString(),
                    "GOODS_RECEIPT"
                    );

            // Update MAC in MongoDB
            if (item.getUnitCost() != null) {
                productService.updateVariantCostPriceMAC(item.getSku().getId().toString(), item.getQuantity(), item.getUnitCost());
            }
        }

        // Update status of Purchase Order
        if (receipt.getPurchaseOrder() != null) {
            PurchaseOrder po = receipt.getPurchaseOrder();
            List<PurchaseOrderItem> poItems = purchaseOrderItemRepository.findByPurchaseOrderId(po.getId());
            
            int totalOrderQty = 0;
            int totalReceivedQty = 0;

            // Loop each goods in PO
            for (PurchaseOrderItem poItem : poItems) {
                // Find out this good in GR how many items
                for (GoodsReceiptItem grItem : items) {
                    if (grItem.getSku().getId().equals(poItem.getSku().getId())) {
                        poItem.setReceivedQuantity(poItem.getReceivedQuantity() + grItem.getQuantity());
                        break;
                    }
                }
                
                totalOrderQty += poItem.getOrderQuantity();
                totalReceivedQty += poItem.getReceivedQuantity();
            }
            
            purchaseOrderItemRepository.saveAll(poItems);

            if (totalReceivedQty >= totalOrderQty) {
                po.setStatus(PurchaseOrderStatus.COMPLETED);
            } else if (totalReceivedQty > 0) {
                po.setStatus(PurchaseOrderStatus.PARTIALLY_RECEIVED);
            }
            
            purchaseOrderRepository.save(po);
        }

        receipt = goodsReceiptRepository.save(receipt);

        auditLogService.log("CONFIRM_GOODS_RECEIPT", SecurityUtils.getCurrentUsername(), 
                "Confirmed Goods Receipt: " + receipt.getReceiptCode());

        return goodsReceiptMapper.toResponse(receipt);
    }
}
