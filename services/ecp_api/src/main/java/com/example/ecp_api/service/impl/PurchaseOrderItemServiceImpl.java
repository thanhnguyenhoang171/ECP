package com.example.ecp_api.service.impl;

import com.example.ecp_api.dto.request.PurchaseOrderItemFilterRequest;
import com.example.ecp_api.dto.request.PurchaseOrderItemRequest;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.PurchaseOrderItemResponse;
import com.example.ecp_api.entity.jpa.PurchaseOrder;
import com.example.ecp_api.entity.jpa.PurchaseOrderItem;
import com.example.ecp_api.entity.jpa.Sku;
import com.example.ecp_api.exception.AppException;
import com.example.ecp_api.mapper.PurchaseOrderItemMapper;
import com.example.ecp_api.repository.jpa.PurchaseOrderItemRepository;
import com.example.ecp_api.repository.jpa.PurchaseOrderRepository;
import com.example.ecp_api.repository.jpa.SkuRepository;
import com.example.ecp_api.service.AuditLogService;
import com.example.ecp_api.service.PurchaseOrderItemService;
import com.example.ecp_api.util.PaginationUtils;
import com.example.ecp_api.util.SecurityUtils;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PurchaseOrderItemServiceImpl implements PurchaseOrderItemService {

    private final PurchaseOrderItemRepository purchaseOrderItemRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SkuRepository skuRepository;
    private final PurchaseOrderItemMapper purchaseOrderItemMapper;
    private final AuditLogService auditLogService;

    @Override
    @Transactional
    public PurchaseOrderItemResponse createPurchaseOrderItem(PurchaseOrderItemRequest request) {
        UUID poId = UUID.fromString(request.getPurchaseOrderId());
        UUID skuId = UUID.fromString(request.getSkuId());

        PurchaseOrder purchaseOrder = purchaseOrderRepository.findById(poId)
                .orElseThrow(() -> new AppException("PURCHASE_ORDER_NOT_FOUND", "Không tìm thấy đơn mua hàng với ID: " + request.getPurchaseOrderId(), HttpStatus.NOT_FOUND));

        Sku sku = skuRepository.findById(skuId)
                .orElseThrow(() -> new AppException("SKU_NOT_FOUND", "Không tìm thấy SKU với ID: " + request.getSkuId(), HttpStatus.NOT_FOUND));

        if (purchaseOrderItemRepository.existsByPurchaseOrderIdAndSkuId(poId, skuId)) {
            throw new AppException("PO_ITEM_EXISTS", "SKU này đã tồn tại trong đơn mua hàng.", HttpStatus.BAD_REQUEST);
        }

        PurchaseOrderItem item = purchaseOrderItemMapper.toEntity(request);
        item.setPurchaseOrder(purchaseOrder);
        item.setSku(sku);

        if (request.getReceivedQuantity() == null) {
            item.setReceivedQuantity(0);
        }

        item = purchaseOrderItemRepository.saveAndFlush(item);

        auditLogService.log("CREATE_PO_ITEM", SecurityUtils.getCurrentUsername(), 
                "Added item to PO " + purchaseOrder.getPoCode() + ": SKU " + sku.getSkuCode() + " qty: " + item.getOrderQuantity());

        return purchaseOrderItemMapper.toResponse(item);
    }

    @Override
    @Transactional
    public PurchaseOrderItemResponse updatePurchaseOrderItem(String id, PurchaseOrderItemRequest request) {
        UUID itemId = UUID.fromString(id);
        UUID poId = UUID.fromString(request.getPurchaseOrderId());
        UUID skuId = UUID.fromString(request.getSkuId());

        PurchaseOrderItem item = purchaseOrderItemRepository.findById(itemId)
                .orElseThrow(() -> new AppException("PO_ITEM_NOT_FOUND", "Không tìm thấy sản phẩm đơn mua hàng với ID: " + id, HttpStatus.NOT_FOUND));

        PurchaseOrder purchaseOrder = purchaseOrderRepository.findById(poId)
                .orElseThrow(() -> new AppException("PURCHASE_ORDER_NOT_FOUND", "Không tìm thấy đơn mua hàng với ID: " + request.getPurchaseOrderId(), HttpStatus.NOT_FOUND));

        Sku sku = skuRepository.findById(skuId)
                .orElseThrow(() -> new AppException("SKU_NOT_FOUND", "Không tìm thấy SKU với ID: " + request.getSkuId(), HttpStatus.NOT_FOUND));

        if (purchaseOrderItemRepository.existsByPurchaseOrderIdAndSkuIdAndIdNot(poId, skuId, itemId)) {
            throw new AppException("PO_ITEM_EXISTS", "SKU này đã tồn tại trong đơn mua hàng.", HttpStatus.BAD_REQUEST);
        }

        purchaseOrderItemMapper.updatePurchaseOrderItemFromRequest(request, item);
        item.setPurchaseOrder(purchaseOrder);
        item.setSku(sku);

        if (request.getReceivedQuantity() != null) {
            item.setReceivedQuantity(request.getReceivedQuantity());
        }

        item = purchaseOrderItemRepository.saveAndFlush(item);

        auditLogService.log("UPDATE_PO_ITEM", SecurityUtils.getCurrentUsername(), 
                "Updated item in PO " + purchaseOrder.getPoCode() + ": SKU " + sku.getSkuCode() + " qty: " + item.getOrderQuantity());

        return purchaseOrderItemMapper.toResponse(item);
    }

    @Override
    public PurchaseOrderItemResponse getPurchaseOrderItemById(String id) {
        PurchaseOrderItem item = purchaseOrderItemRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new AppException("PO_ITEM_NOT_FOUND", "Không tìm thấy sản phẩm đơn mua hàng với ID: " + id, HttpStatus.NOT_FOUND));

        return purchaseOrderItemMapper.toResponse(item);
    }

    @Override
    public PageResponse<PurchaseOrderItemResponse> getAllPurchaseOrderItems(PurchaseOrderItemFilterRequest filter, Pageable pageable) {
        Pageable finalPageable = PaginationUtils.applyStableSort(pageable, 
                Sort.Order.asc("id"));

        Specification<PurchaseOrderItem> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter != null) {
                if (StringUtils.hasText(filter.getPurchaseOrderId())) {
                    try {
                        predicates.add(cb.equal(root.get("purchaseOrder").get("id"), UUID.fromString(filter.getPurchaseOrderId())));
                    } catch (IllegalArgumentException e) {
                        // Ignore invalid UUID
                    }
                }

                if (StringUtils.hasText(filter.getSkuId())) {
                    try {
                        predicates.add(cb.equal(root.get("sku").get("id"), UUID.fromString(filter.getSkuId())));
                    } catch (IllegalArgumentException e) {
                        // Ignore invalid UUID
                    }
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<PurchaseOrderItem> page = purchaseOrderItemRepository.findAll(spec, finalPageable);
        return purchaseOrderItemMapper.toPageResponse(page);
    }

    @Override
    @Transactional
    public void deletePurchaseOrderItem(String id) {
        PurchaseOrderItem item = purchaseOrderItemRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new AppException("PO_ITEM_NOT_FOUND", "Không tìm thấy sản phẩm đơn mua hàng với ID: " + id, HttpStatus.NOT_FOUND));

        purchaseOrderItemRepository.delete(item);

        auditLogService.log("DELETE_PO_ITEM", SecurityUtils.getCurrentUsername(), 
                "Deleted item " + item.getId() + " from PO " + item.getPurchaseOrder().getPoCode());
    }
}
