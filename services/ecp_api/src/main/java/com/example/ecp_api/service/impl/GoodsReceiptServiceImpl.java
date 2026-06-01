package com.example.ecp_api.service.impl;

import com.example.ecp_api.dto.request.GoodsReceiptRequest;
import com.example.ecp_api.dto.response.GoodsReceiptResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.entity.jpa.GoodsReceipt;
import com.example.ecp_api.entity.jpa.PurchaseOrder;
import com.example.ecp_api.entity.jpa.Warehouse;
import com.example.ecp_api.enums.common.ReceiptStatus;
import com.example.ecp_api.exception.AppException;
import com.example.ecp_api.mapper.GoodsReceiptMapper;
import com.example.ecp_api.repository.jpa.GoodsReceiptRepository;
import com.example.ecp_api.repository.jpa.PurchaseOrderRepository;
import com.example.ecp_api.repository.jpa.WarehouseRepository;
import com.example.ecp_api.service.AuditLogService;
import com.example.ecp_api.service.GoodsReceiptService;
import com.example.ecp_api.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GoodsReceiptServiceImpl implements GoodsReceiptService {

    private final GoodsReceiptRepository goodsReceiptRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final WarehouseRepository warehouseRepository;
    private final GoodsReceiptMapper goodsReceiptMapper;
    private final AuditLogService auditLogService;

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

        receipt = goodsReceiptRepository.save(receipt);
        return goodsReceiptMapper.toResponse(receipt);
    }

    @Override
    public GoodsReceiptResponse getGoodsReceiptById(String id) {
        GoodsReceipt receipt = goodsReceiptRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new AppException("RECEIPT_NOT_FOUND", "Không tìm thấy phiếu nhập.", HttpStatus.NOT_FOUND));
        return goodsReceiptMapper.toResponse(receipt);
    }

    @Override
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

        receipt.setStatus(ReceiptStatus.RECEIVED);
        receipt.setReceivedAt(LocalDateTime.now());

        receipt = goodsReceiptRepository.save(receipt);

        auditLogService.log("CONFIRM_GOODS_RECEIPT", SecurityUtils.getCurrentUsername(), 
                "Confirmed Goods Receipt: " + receipt.getReceiptCode());

        return goodsReceiptMapper.toResponse(receipt);
    }
}
