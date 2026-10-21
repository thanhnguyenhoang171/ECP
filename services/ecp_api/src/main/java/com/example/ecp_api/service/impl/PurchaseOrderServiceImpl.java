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
import com.example.ecp_api.service.helper.PurchaseOrderHelper;
import com.example.ecp_api.util.PaginationUtils;
import com.example.ecp_api.util.SecurityUtils;
import com.example.ecp_api.security.DataOwnership;
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

    private final org.springframework.data.mongodb.core.MongoTemplate ownershipMongo;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final WarehouseRepository warehouseRepository;
    private final SupplierRepository supplierRepository;
    private final PurchaseOrderHelper purchaseOrderHelper;
    private final PurchaseOrderMapper purchaseOrderMapper;
    private final AuditLogService auditLogService;

    @Override
    @Transactional
    public PurchaseOrderResponse createPurchaseOrder(PurchaseOrderRequest request) {
        if (purchaseOrderRepository.existsByPoCode(request.getPoCode())) {
            throw new AppException("PO_CODE_EXISTS", "Mã đơn mua hàng đã tồn tại: " + request.getPoCode(), HttpStatus.BAD_REQUEST);
        }

        Warehouse warehouse = warehouseRepository.findById(UUID.fromString(request.getWarehouseId()))
                .filter(value -> value.getDeletedAt() == null)
                .orElseThrow(() -> new AppException("WAREHOUSE_NOT_FOUND", "Không tìm thấy kho hàng với ID: " + request.getWarehouseId(), HttpStatus.NOT_FOUND));
        DataOwnership.require(warehouse.getCreatedBy());

        Supplier supplier = supplierRepository.findById(UUID.fromString(request.getSupplierId()))
                .filter(value -> value.getDeletedAt() == null)
                .orElseThrow(() -> new AppException("SUPPLIER_NOT_FOUND", "Không tìm thấy nhà cung cấp với ID: " + request.getSupplierId(), HttpStatus.NOT_FOUND));
        DataOwnership.require(supplier.getCreatedBy());

        if (!warehouse.isActive() || !supplier.isActive()) {
            throw new AppException("INACTIVE_REFERENCE", "Kho hàng và nhà cung cấp phải đang hoạt động.", HttpStatus.BAD_REQUEST);
        }
        PurchaseOrder purchaseOrder = purchaseOrderMapper.toEntity(request);
        purchaseOrder.setWarehouse(warehouse);
        purchaseOrder.setSupplier(supplier);

        purchaseOrderHelper.processPurchaseOrderItems(request, purchaseOrder);

        purchaseOrder.setStatus(PurchaseOrderStatus.DRAFT);

        purchaseOrder = purchaseOrderRepository.saveAndFlush(purchaseOrder);

        auditLogService.log("PURCHASE_ORDER_CREATE", SecurityUtils.getCurrentUserEmail(),
                "Created purchase order: " + purchaseOrder.getPoCode() + " for warehouse: " + warehouse.getName() + " and supplier: " + supplier.getName());

        return purchaseOrderMapper.toResponse(purchaseOrder);
    }

    @Override
    @Transactional
    public PurchaseOrderAdminResponse createPurchaseOrderAdmin(PurchaseOrderRequest request) {
        if (purchaseOrderRepository.existsByPoCode(request.getPoCode())) {
            throw new AppException("PO_CODE_EXISTS", "Mã đơn mua hàng đã tồn tại: " + request.getPoCode(), HttpStatus.BAD_REQUEST);
        }
        Warehouse warehouse = warehouseRepository.findById(UUID.fromString(request.getWarehouseId()))
                .filter(value -> value.getDeletedAt() == null)
                .orElseThrow(() -> new AppException("WAREHOUSE_NOT_FOUND", "Không tìm thấy kho hàng với ID: " + request.getWarehouseId(), HttpStatus.NOT_FOUND));
        DataOwnership.require(warehouse.getCreatedBy());
        Supplier supplier = supplierRepository.findById(UUID.fromString(request.getSupplierId()))
                .filter(value -> value.getDeletedAt() == null)
                .orElseThrow(() -> new AppException("SUPPLIER_NOT_FOUND", "Không tìm thấy nhà cung cấp với ID: " + request.getSupplierId(), HttpStatus.NOT_FOUND));
        DataOwnership.require(supplier.getCreatedBy());
        if (!warehouse.isActive() || !supplier.isActive()) {
            throw new AppException("INACTIVE_REFERENCE", "Kho hàng và nhà cung cấp phải đang hoạt động.", HttpStatus.BAD_REQUEST);
        }
        PurchaseOrder purchaseOrder = purchaseOrderMapper.toEntity(request);
        purchaseOrder.setWarehouse(warehouse);
        purchaseOrder.setSupplier(supplier);
        purchaseOrderHelper.processPurchaseOrderItems(request, purchaseOrder);
        if (request.getStatus() == null) { purchaseOrder.setStatus(PurchaseOrderStatus.DRAFT); }
        purchaseOrder = purchaseOrderRepository.saveAndFlush(purchaseOrder);
        auditLogService.log("PURCHASE_ORDER_CREATE", SecurityUtils.getCurrentUserEmail(),
                "Created purchase order: " + purchaseOrder.getPoCode() + " for warehouse: " + warehouse.getName() + " and supplier: " + supplier.getName());
        return purchaseOrderMapper.toAdminResponse(purchaseOrder);
    }

    @Override
    @Transactional
    public PurchaseOrderResponse updatePurchaseOrder(String id, PurchaseOrderRequest request) {
        PurchaseOrder purchaseOrder = purchaseOrderRepository.findForUpdate(UUID.fromString(id))
                .orElseThrow(() -> new AppException("PURCHASE_ORDER_NOT_FOUND", "Không tìm thấy đơn mua hàng với ID: " + id, HttpStatus.NOT_FOUND));
        DataOwnership.requireOrder(purchaseOrder, ownershipMongo);

        if (purchaseOrder.getStatus() != PurchaseOrderStatus.DRAFT) {
            throw new AppException("INVALID_STATUS", "Chỉ được sửa đơn mua hàng ở trạng thái nháp.", HttpStatus.BAD_REQUEST);
        }
        if (request.getStatus() != null && request.getStatus() != PurchaseOrderStatus.DRAFT) {
            throw new AppException("INVALID_STATUS", "Hãy dùng thao tác chuyển trạng thái đơn mua hàng.", HttpStatus.BAD_REQUEST);
        }

        if (!purchaseOrder.getPoCode().equals(request.getPoCode()) && purchaseOrderRepository.existsByPoCode(request.getPoCode())) {
            throw new AppException("PO_CODE_EXISTS", "Mã đơn mua hàng đã tồn tại: " + request.getPoCode(), HttpStatus.BAD_REQUEST);
        }

        Warehouse warehouse = warehouseRepository.findById(UUID.fromString(request.getWarehouseId()))
                .filter(value -> value.getDeletedAt() == null)
                .orElseThrow(() -> new AppException("WAREHOUSE_NOT_FOUND", "Không tìm thấy kho hàng với ID: " + request.getWarehouseId(), HttpStatus.NOT_FOUND));
        DataOwnership.require(warehouse.getCreatedBy());

        Supplier supplier = supplierRepository.findById(UUID.fromString(request.getSupplierId()))
                .filter(value -> value.getDeletedAt() == null)
                .orElseThrow(() -> new AppException("SUPPLIER_NOT_FOUND", "Không tìm thấy nhà cung cấp với ID: " + request.getSupplierId(), HttpStatus.NOT_FOUND));
        DataOwnership.require(supplier.getCreatedBy());

        purchaseOrderMapper.updatePurchaseOrderFromRequest(request, purchaseOrder);
        purchaseOrder.setWarehouse(warehouse);
        purchaseOrder.setSupplier(supplier);

        purchaseOrderHelper.processPurchaseOrderItems(request, purchaseOrder);

        if (request.getStatus() != null) {
            purchaseOrder.setStatus(request.getStatus());
        }

        purchaseOrder = purchaseOrderRepository.saveAndFlush(purchaseOrder);

        auditLogService.log("PURCHASE_ORDER_UPDATE", SecurityUtils.getCurrentUserEmail(),
                "Updated purchase order: " + purchaseOrder.getPoCode() + " status: " + purchaseOrder.getStatus());

        return purchaseOrderMapper.toResponse(purchaseOrder);
    }

    @Override
    @Transactional
    public PurchaseOrderAdminResponse updatePurchaseOrderAdmin(String id, PurchaseOrderRequest request) {
        PurchaseOrder purchaseOrder = purchaseOrderRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new AppException("PURCHASE_ORDER_NOT_FOUND", "Không tìm thấy đơn mua hàng với ID: " + id, HttpStatus.NOT_FOUND));
        DataOwnership.requireOrder(purchaseOrder, ownershipMongo);
        if (!purchaseOrder.getPoCode().equals(request.getPoCode()) && purchaseOrderRepository.existsByPoCode(request.getPoCode())) {
            throw new AppException("PO_CODE_EXISTS", "Mã đơn mua hàng đã tồn tại: " + request.getPoCode(), HttpStatus.BAD_REQUEST);
        }
        Warehouse warehouse = warehouseRepository.findById(UUID.fromString(request.getWarehouseId()))
                .filter(value -> value.getDeletedAt() == null)
                .orElseThrow(() -> new AppException("WAREHOUSE_NOT_FOUND", "Không tìm thấy kho hàng với ID: " + request.getWarehouseId(), HttpStatus.NOT_FOUND));
        DataOwnership.require(warehouse.getCreatedBy());
        Supplier supplier = supplierRepository.findById(UUID.fromString(request.getSupplierId()))
                .filter(value -> value.getDeletedAt() == null)
                .orElseThrow(() -> new AppException("SUPPLIER_NOT_FOUND", "Không tìm thấy nhà cung cấp với ID: " + request.getSupplierId(), HttpStatus.NOT_FOUND));
        DataOwnership.require(supplier.getCreatedBy());
        purchaseOrderMapper.updatePurchaseOrderFromRequest(request, purchaseOrder);
        purchaseOrder.setWarehouse(warehouse);
        purchaseOrder.setSupplier(supplier);
        purchaseOrderHelper.processPurchaseOrderItems(request, purchaseOrder);
        if (request.getStatus() != null) { purchaseOrder.setStatus(request.getStatus()); }
        purchaseOrder = purchaseOrderRepository.saveAndFlush(purchaseOrder);
        auditLogService.log("PURCHASE_ORDER_UPDATE", SecurityUtils.getCurrentUserEmail(),
                "Updated purchase order: " + purchaseOrder.getPoCode() + " status: " + purchaseOrder.getStatus());
        return purchaseOrderMapper.toAdminResponse(purchaseOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseOrderResponse getPurchaseOrderById(String id) {
        PurchaseOrder purchaseOrder = purchaseOrderRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new AppException("PURCHASE_ORDER_NOT_FOUND", "Không tìm thấy đơn mua hàng với ID: " + id, HttpStatus.NOT_FOUND));
        DataOwnership.requireOrder(purchaseOrder, ownershipMongo);

        return purchaseOrderMapper.toResponse(purchaseOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseOrderAdminResponse getPurchaseOrderByIdAdmin(String id) {
        PurchaseOrder purchaseOrder = purchaseOrderRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new AppException("PURCHASE_ORDER_NOT_FOUND", "Không tìm thấy đơn mua hàng với ID: " + id, HttpStatus.NOT_FOUND));
        DataOwnership.requireOrder(purchaseOrder, ownershipMongo);

        return purchaseOrderMapper.toAdminResponse(purchaseOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PurchaseOrderResponse> getAllPurchaseOrders(PurchaseOrderFilterRequest filter, Pageable pageable) {
        Pageable finalPageable = PaginationUtils.applyStableSort(pageable,
                Sort.Order.desc("createdAt"),
                Sort.Order.asc("id"));

        Specification<PurchaseOrder> spec = createSpecification(filter);

        Page<PurchaseOrder> purchaseOrderPage = purchaseOrderRepository.findAll(spec, finalPageable);
        return purchaseOrderMapper.toPageResponse(purchaseOrderPage);
    }

    @Override
    @Transactional(readOnly = true)
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
        PurchaseOrder purchaseOrder = purchaseOrderRepository.findForUpdate(UUID.fromString(id))
                .orElseThrow(() -> new AppException("PURCHASE_ORDER_NOT_FOUND", "Không tìm thấy đơn mua hàng với ID: " + id, HttpStatus.NOT_FOUND));
        DataOwnership.requireOrder(purchaseOrder, ownershipMongo);

        if (purchaseOrder.getStatus() != PurchaseOrderStatus.DRAFT) {
            throw new AppException("INVALID_STATUS", "Chỉ được xoá đơn mua hàng nháp.", HttpStatus.BAD_REQUEST);
        }
        purchaseOrder.setDeletedAt(java.time.LocalDateTime.now());
        purchaseOrder.setDeletedBy(SecurityUtils.getCurrentUserEmail());
        purchaseOrderRepository.save(purchaseOrder);

        auditLogService.log("PURCHASE_ORDER_DELETE", SecurityUtils.getCurrentUserEmail(),
                "Deleted purchase order: " + purchaseOrder.getPoCode());
    }
    @Override
    @Transactional
    public PurchaseOrderResponse updateStatus(String id, PurchaseOrderStatus status) {
        PurchaseOrder order = purchaseOrderRepository.findForUpdate(UUID.fromString(id))
                .orElseThrow(() -> new AppException("PURCHASE_ORDER_NOT_FOUND", "Không tìm thấy đơn mua hàng.", HttpStatus.NOT_FOUND));
        DataOwnership.requireOrder(order, ownershipMongo);

        boolean allowed = (order.getStatus() == PurchaseOrderStatus.DRAFT
                && (status == PurchaseOrderStatus.ORDERED || status == PurchaseOrderStatus.CANCELLED))
                || (order.getStatus() == PurchaseOrderStatus.ORDERED && status == PurchaseOrderStatus.CANCELLED);
        if (!allowed) {
            throw new AppException("INVALID_STATUS", "Không thể chuyển trạng thái đơn mua hàng. Hoàn tất đơn được xác định theo số lượng thực nhập.", HttpStatus.BAD_REQUEST);
        }
        order.setStatus(status);
        order = purchaseOrderRepository.saveAndFlush(order);
        auditLogService.log("PURCHASE_ORDER_STATUS", SecurityUtils.getCurrentUserEmail(), "Updated " + order.getPoCode() + " to " + status);
        return purchaseOrderMapper.toResponse(order);
    }

}
