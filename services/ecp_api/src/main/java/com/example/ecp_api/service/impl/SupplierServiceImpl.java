package com.example.ecp_api.service.impl;

import com.example.ecp_api.dto.request.SupplierRequest;
import com.example.ecp_api.dto.request.SupplierRequestFilter;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.SupplierResponse;
import com.example.ecp_api.entity.jpa.Supplier;
import com.example.ecp_api.exception.ResourceNotFoundException;
import com.example.ecp_api.mapper.SupplierMapper;
import com.example.ecp_api.repository.jpa.SupplierRepository;
import com.example.ecp_api.service.AuditLogService;
import com.example.ecp_api.service.SupplierService;
import com.example.ecp_api.util.PaginationUtils;
import com.example.ecp_api.util.SecurityUtils;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
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

    @Override
    @Transactional
    public SupplierResponse createSupplier(SupplierRequest request) {
        Supplier supplier = supplierMapper.toEntity(request);
        supplier = supplierRepository.save(supplier);
        auditLogService.log("CREATE_SUPPLIER", SecurityUtils.getCurrentUsername(), "Created supplier: " + supplier.getName());
        return supplierMapper.toResponse(supplier);
    }

    @Override
    @Transactional
    public SupplierResponse updateSupplier(String id, SupplierRequest request) {
        Supplier supplier = supplierRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
        
        supplierMapper.updateSupplierFromRequest(request, supplier);
        supplier = supplierRepository.save(supplier);
        auditLogService.log("UPDATE_SUPPLIER", SecurityUtils.getCurrentUsername(), "Updated supplier: " + supplier.getName());
        return supplierMapper.toResponse(supplier);
    }

    @Override
    public SupplierResponse getSupplierById(String id) {
        Supplier supplier = supplierRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
        
        return supplierMapper.toResponse(supplier);
    }

    @Override
    public PageResponse<SupplierResponse> getAllSuppliers(SupplierRequestFilter filter, Pageable pageable) {
        Pageable finalPageable = PaginationUtils.applyStableSort(pageable, 
                Sort.Order.desc("createdAt"), 
                Sort.Order.asc("id"));

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

        Page<Supplier> supplierPage = supplierRepository.findAll(spec, finalPageable);
        
        return supplierMapper.toPageResponse(supplierPage);
    }

    @Override
    @Transactional
    public void deleteSupplier(String id) {
        Supplier supplier = supplierRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
        supplierRepository.delete(supplier);
        auditLogService.log("DELETE_SUPPLIER", SecurityUtils.getCurrentUsername(), "Deleted supplier: " + supplier.getName());
    }
}
