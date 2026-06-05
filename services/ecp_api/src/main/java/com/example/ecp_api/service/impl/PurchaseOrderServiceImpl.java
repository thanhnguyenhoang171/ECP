package com.example.ecp_api.service.impl;

import com.example.ecp_api.dto.request.PurchaseOrderFilterRequest;
import com.example.ecp_api.dto.request.PurchaseOrderRequest;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.PurchaseOrderAdminResponse;
import com.example.ecp_api.dto.response.PurchaseOrderResponse;
import com.example.ecp_api.entity.jpa.PurchaseOrder;
import com.example.ecp_api.entity.jpa.Supplier;
import com.example.ecp_api.entity.jpa.Warehouse;
import com.example.ecp_api.enums.common.PurchaseOrderStatus;
import com.example.ecp_api.exception.AppException;
import com.example.ecp_api.mapper.PurchaseOrderMapper;
import com.example.ecp_api.repository.jpa.PurchaseOrderRepository;
import com.example.ecp_api.repository.jpa.SupplierRepository;
import com.example.ecp_api.repository.jpa.WarehouseRepository;
import com.example.ecp_api.service.AuditLogService;
import com.example.ecp_api.service.PurchaseOrderService;
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
public class PurchaseOrderServiceImpl implements PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final WarehouseRepository warehouseRepository;
    private final SupplierRepository supplierRepository;
    private final PurchaseOrderMapper purchaseOrderMapper;
    private final AuditLogService auditLogService;

    @Override
    @Transactional
    public PurchaseOrderResponse createPurchaseOrder(PurchaseOrderRequest request) {
        if (purchaseOrderRepository.existsByPoCode(request.getPoCode())) {
            throw new AppException("PO_CODE_EXISTS", "Mã đơn mua hàng đã tồn tại: " + request.getPoCode(), HttpStatus.BAD_REQUEST);
        }

        Warehouse warehouse = warehouseRepository.findById(UUID.fromString(request.getWarehouseId()))
                .orElseThrow(() -> new AppException("WAREHOUSE_NOT_FOUND", "Không tìm thấy kho hàng với ID: " + request.getWarehouseId(), HttpStatus.NOT_FOUND));

        Supplier supplier = supplierRepository.findById(UUID.fromString(request.getSupplierId()))
                .orElseThrow(() -> new AppException("SUPPLIER_NOT_FOUND", "Không tìm thấy nhà cung cấp với ID: " + request.getSupplierId(), HttpStatus.NOT_FOUND));

        PurchaseOrder purchaseOrder = purchaseOrderMapper.toEntity(request);
        purchaseOrder.setWarehouse(warehouse);
        purchaseOrder.setSupplier(supplier);

        if (request.getStatus() == null) {
            purchaseOrder.setStatus(PurchaseOrderStatus.DRAFT);
        }

        purchaseOrder = purchaseOrderRepository.saveAndFlush(purchaseOrder);

        auditLogService.log("CREATE_PURCHASE_ORDER", SecurityUtils.getCurrentUsername(), 
                "Created purchase order: " + purchaseOrder.getPoCode() + " for warehouse: " + warehouse.getName() + " and supplier: " + supplier.getName());

        return purchaseOrderMapper.toResponse(purchaseOrder);
    }

    @Override
    @Transactional
    public PurchaseOrderResponse updatePurchaseOrder(String id, PurchaseOrderRequest request) {
        PurchaseOrder purchaseOrder = purchaseOrderRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new AppException("PURCHASE_ORDER_NOT_FOUND", "Không tìm thấy đơn mua hàng với ID: " + id, HttpStatus.NOT_FOUND));

        if (!purchaseOrder.getPoCode().equals(request.getPoCode()) && purchaseOrderRepository.existsByPoCode(request.getPoCode())) {
            throw new AppException("PO_CODE_EXISTS", "Mã đơn mua hàng đã tồn tại: " + request.getPoCode(), HttpStatus.BAD_REQUEST);
        }

        Warehouse warehouse = warehouseRepository.findById(UUID.fromString(request.getWarehouseId()))
                .orElseThrow(() -> new AppException("WAREHOUSE_NOT_FOUND", "Không tìm thấy kho hàng với ID: " + request.getWarehouseId(), HttpStatus.NOT_FOUND));

        Supplier supplier = supplierRepository.findById(UUID.fromString(request.getSupplierId()))
                .orElseThrow(() -> new AppException("SUPPLIER_NOT_FOUND", "Không tìm thấy nhà cung cấp với ID: " + request.getSupplierId(), HttpStatus.NOT_FOUND));

        purchaseOrderMapper.updatePurchaseOrderFromRequest(request, purchaseOrder);
        purchaseOrder.setWarehouse(warehouse);
        purchaseOrder.setSupplier(supplier);

        if (request.getStatus() != null) {
            purchaseOrder.setStatus(request.getStatus());
        }

        purchaseOrder = purchaseOrderRepository.saveAndFlush(purchaseOrder);

        auditLogService.log("UPDATE_PURCHASE_ORDER", SecurityUtils.getCurrentUsername(), 
                "Updated purchase order: " + purchaseOrder.getPoCode() + " status: " + purchaseOrder.getStatus());

        return purchaseOrderMapper.toResponse(purchaseOrder);
    }

    @Override
    public PurchaseOrderResponse getPurchaseOrderById(String id) {
        PurchaseOrder purchaseOrder = purchaseOrderRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new AppException("PURCHASE_ORDER_NOT_FOUND", "Không tìm thấy đơn mua hàng với ID: " + id, HttpStatus.NOT_FOUND));

        return purchaseOrderMapper.toResponse(purchaseOrder);
    }

    @Override
    public PurchaseOrderAdminResponse getPurchaseOrderByIdAdmin(String id) {
        PurchaseOrder purchaseOrder = purchaseOrderRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new AppException("PURCHASE_ORDER_NOT_FOUND", "Không tìm thấy đơn mua hàng với ID: " + id, HttpStatus.NOT_FOUND));

        return purchaseOrderMapper.toAdminResponse(purchaseOrder);
    }

    @Override
    public PageResponse<PurchaseOrderResponse> getAllPurchaseOrders(PurchaseOrderFilterRequest filter, Pageable pageable) {
        Pageable finalPageable = PaginationUtils.applyStableSort(pageable, 
                Sort.Order.desc("createdAt"), 
                Sort.Order.asc("id"));

        Specification<PurchaseOrder> spec = createSpecification(filter);

        Page<PurchaseOrder> purchaseOrderPage = purchaseOrderRepository.findAll(spec, finalPageable);
        return purchaseOrderMapper.toPageResponse(purchaseOrderPage);
    }

    @Override
    public PageResponse<PurchaseOrderAdminResponse> getAllPurchaseOrdersAdmin(PurchaseOrderFilterRequest filter, Pageable pageable) {
        Pageable finalPageable = PaginationUtils.applyStableSort(pageable, 
                Sort.Order.desc("createdAt"), 
                Sort.Order.asc("id"));

        Specification<PurchaseOrder> spec = createSpecification(filter);

        Page<PurchaseOrder> purchaseOrderPage = purchaseOrderRepository.findAll(spec, finalPageable);
        return purchaseOrderMapper.toAdminPageResponse(purchaseOrderPage);
    }

    private Specification<PurchaseOrder> createSpecification(PurchaseOrderFilterRequest filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter != null) {
                if (StringUtils.hasText(filter.getKeyword())) {
                    String searchPattern = "%" + filter.getKeyword().toLowerCase() + "%";
                    predicates.add(cb.or(
                            cb.like(cb.lower(root.get("poCode")), searchPattern),
                            cb.like(cb.lower(root.get("note")), searchPattern)
                    ));
                }

                if (StringUtils.hasText(filter.getWarehouseId())) {
                    try {
                        predicates.add(cb.equal(root.get("warehouse").get("id"), UUID.fromString(filter.getWarehouseId())));
                    } catch (IllegalArgumentException e) {
                        // Ignore invalid UUID
                    }
                }

                if (StringUtils.hasText(filter.getSupplierId())) {
                    try {
                        predicates.add(cb.equal(root.get("supplier").get("id"), UUID.fromString(filter.getSupplierId())));
                    } catch (IllegalArgumentException e) {
                        // Ignore invalid UUID
                    }
                }

                if (filter.getStatus() != null) {
                    predicates.add(cb.equal(root.get("status"), filter.getStatus()));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    @Override
    @Transactional
    public void deletePurchaseOrder(String id) {
        PurchaseOrder purchaseOrder = purchaseOrderRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new AppException("PURCHASE_ORDER_NOT_FOUND", "Không tìm thấy đơn mua hàng với ID: " + id, HttpStatus.NOT_FOUND));

        purchaseOrderRepository.delete(purchaseOrder);

        auditLogService.log("DELETE_PURCHASE_ORDER", SecurityUtils.getCurrentUsername(), 
                "Deleted purchase order: " + purchaseOrder.getPoCode());
    }
}
