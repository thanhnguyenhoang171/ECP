package com.example.ecp_api.service.impl;

import com.example.ecp_api.dto.request.SupplierRequest;
import com.example.ecp_api.dto.request.SupplierRequestFilter;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.SupplierAdminResponse;
import com.example.ecp_api.dto.response.SupplierResponse;
import com.example.ecp_api.entity.jpa.Supplier;
import com.example.ecp_api.exception.AppException;
import com.example.ecp_api.mapper.SupplierMapper;
import com.example.ecp_api.repository.jpa.PurchaseOrderRepository;
import com.example.ecp_api.repository.jpa.SupplierRepository;
import com.example.ecp_api.service.AuditLogService;
import com.example.ecp_api.service.SupplierService;
import com.example.ecp_api.util.SecurityUtils;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;
    private final SupplierMapper supplierMapper;
    private final AuditLogService auditLogService;
    private final PurchaseOrderRepository purchaseOrderRepository;

    @Override
    @Transactional
    public SupplierResponse createSupplier(SupplierRequest request) {
        if (supplierRepository.existsByName(request.getName())) {
            throw new AppException("SUPPLIER_NAME_EXISTS", "Tên nhà cung cấp đã tồn tại: " + request.getName(), HttpStatus.BAD_REQUEST);
        }
        if (StringUtils.hasText(request.getEmail()) && supplierRepository.existsByEmail(request.getEmail())) {
            throw new AppException("SUPPLIER_EMAIL_EXISTS", "Email nhà cung cấp đã tồn tại: " + request.getEmail(), HttpStatus.BAD_REQUEST);
        }
        if (StringUtils.hasText(request.getTaxCode()) && supplierRepository.existsByTaxCode(request.getTaxCode())) {
            throw new AppException("SUPPLIER_TAX_CODE_EXISTS", "Mã số thuế đã tồn tại: " + request.getTaxCode(), HttpStatus.BAD_REQUEST);
        }

        Supplier supplier = supplierMapper.toEntity(request);
        supplier = supplierRepository.save(supplier);
        auditLogService.log("CREATE_SUPPLIER", SecurityUtils.getCurrentUsername(), "Created supplier: " + supplier.getName());
        return supplierMapper.toResponse(supplier);
    }

    @Override
    @Transactional
    public SupplierResponse updateSupplier(String id, SupplierRequest request) {
        Supplier supplier = supplierRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new AppException("SUPPLIER_NOT_FOUND", "Không tìm thấy nhà cung cấp với ID: " + id, HttpStatus.NOT_FOUND));
        
        if (StringUtils.hasText(request.getName()) && !supplier.getName().equals(request.getName()) && supplierRepository.existsByName(request.getName())) {
            throw new AppException("SUPPLIER_NAME_EXISTS", "Tên nhà cung cấp đã tồn tại: " + request.getName(), HttpStatus.BAD_REQUEST);
        }
        if (StringUtils.hasText(request.getEmail()) && !request.getEmail().equals(supplier.getEmail()) && supplierRepository.existsByEmail(request.getEmail())) {
            throw new AppException("SUPPLIER_EMAIL_EXISTS", "Email nhà cung cấp đã tồn tại: " + request.getEmail(), HttpStatus.BAD_REQUEST);
        }
        if (StringUtils.hasText(request.getTaxCode()) && !request.getTaxCode().equals(supplier.getTaxCode()) && supplierRepository.existsByTaxCode(request.getTaxCode())) {
            throw new AppException("SUPPLIER_TAX_CODE_EXISTS", "Mã số thuế đã tồn tại: " + request.getTaxCode(), HttpStatus.BAD_REQUEST);
        }

        supplierMapper.updateSupplierFromRequest(request, supplier);
        supplier = supplierRepository.save(supplier);
        auditLogService.log("UPDATE_SUPPLIER", SecurityUtils.getCurrentUsername(), "Updated supplier: " + supplier.getName());
        return supplierMapper.toResponse(supplier);
    }

    @Override
    public SupplierResponse getSupplierById(String id) {
        Supplier supplier = supplierRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new AppException("SUPPLIER_NOT_FOUND", "Không tìm thấy nhà cung cấp với ID: " + id, HttpStatus.NOT_FOUND));
        
        return supplierMapper.toResponse(supplier);
    }

    @Override
    public SupplierAdminResponse getSupplierByIdForAdmin(String id) {
        Supplier supplier = supplierRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new AppException("SUPPLIER_NOT_FOUND", "Không tìm thấy nhà cung cấp với ID: " + id, HttpStatus.NOT_FOUND));

        return supplierMapper.toAdminResponse(supplier);
    }

    @Override
    public PageResponse<SupplierResponse> getAllSuppliers(SupplierRequestFilter filter, Pageable pageable) {
        Page<Supplier> supplierPage = searchSuppliers(filter, pageable);
        return supplierMapper.toPageResponse(supplierPage);
    }

    @Override
    public PageResponse<SupplierAdminResponse> getAllSuppliersForAdmin(SupplierRequestFilter filter, Pageable pageable) {
        Page<Supplier> supplierPage = searchSuppliers(filter, pageable);
        return supplierMapper.toAdminPageResponse(supplierPage);
    }

    private Page<Supplier> searchSuppliers(SupplierRequestFilter filter, Pageable pageable) {
        Specification<Supplier> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter != null) {
                if (StringUtils.hasText(filter.getKeyword())) {
                    String pattern = "%" + filter.getKeyword().toLowerCase() + "%";
                    predicates.add(cb.or(
                            cb.like(cb.lower(root.get("name")), pattern),
                            cb.like(cb.lower(root.get("email")), pattern),
                            cb.like(cb.lower(root.get("taxCode")), pattern)
                    ));
                }
                if (filter.getActive() != null) {
                    predicates.add(cb.equal(root.get("active"), filter.getActive()));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return supplierRepository.findAll(spec, pageable);
    }

    @Override
    @Transactional
    public void deleteSupplier(String id) {
        Supplier supplier = supplierRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new AppException("SUPPLIER_NOT_FOUND", "Không tìm thấy nhà cung cấp với ID: " + id, HttpStatus.NOT_FOUND));
        
        if (purchaseOrderRepository.existsBySupplierId(supplier.getId())) {
            throw new AppException("SUPPLIER_HAS_TRANSACTIONS", "Không thể xóa nhà cung cấp đã có đơn mua hàng", HttpStatus.BAD_REQUEST);
        }

        supplierRepository.delete(supplier);
        auditLogService.log("DELETE_SUPPLIER", SecurityUtils.getCurrentUsername(), "Deleted supplier: " + supplier.getName());
    }
}
