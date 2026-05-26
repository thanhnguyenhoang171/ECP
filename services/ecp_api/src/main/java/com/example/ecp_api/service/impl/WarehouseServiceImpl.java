package com.example.ecp_api.service.impl;

import com.example.ecp_api.dto.request.WarehouseFilterRequest;
import com.example.ecp_api.dto.request.WarehouseRequest;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.WarehouseResponse;
import com.example.ecp_api.entity.jpa.Warehouse;
import com.example.ecp_api.exception.AppException;
import com.example.ecp_api.mapper.WarehouseMapper;
import com.example.ecp_api.repository.jpa.WarehouseRepository;
import com.example.ecp_api.service.AuditLogService;
import com.example.ecp_api.service.WarehouseService;
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

@Service
@RequiredArgsConstructor
public class WarehouseServiceImpl implements WarehouseService {

    private final WarehouseRepository warehouseRepository;
    private final WarehouseMapper warehouseMapper;
    private final AuditLogService auditLogService;

    @Override
    @Transactional
    public WarehouseResponse createWarehouse(WarehouseRequest request) {
        if (warehouseRepository.existsByCode(request.getCode())) {
            throw new AppException("WAREHOUSE_CODE_EXISTS", "Mã kho đã tồn tại: " + request.getCode(), HttpStatus.BAD_REQUEST);
        }

        Warehouse warehouse = warehouseMapper.toEntity(request);
        if (request.getIsActive() == null) {
            warehouse.setActive(true);
        }

        warehouse = warehouseRepository.save(warehouse);

        auditLogService.log("CREATE_WAREHOUSE", SecurityUtils.getCurrentUsername(), "Created warehouse: " + warehouse.getName() + " (" + warehouse.getCode() + ")");

        return warehouseMapper.toResponse(warehouse);
    }

    @Override
    @Transactional
    public WarehouseResponse updateWarehouse(String id, WarehouseRequest request) {
        Warehouse warehouse = warehouseRepository.findById(java.util.UUID.fromString(id))
                .orElseThrow(() -> new AppException("WAREHOUSE_NOT_FOUND", "Không tìm thấy kho hàng với ID: " + id, HttpStatus.NOT_FOUND));

        // Check if code is changed and if new code already exists
        if (!warehouse.getCode().equals(request.getCode()) && warehouseRepository.existsByCode(request.getCode())) {
            throw new AppException("WAREHOUSE_CODE_EXISTS", "Mã kho đã tồn tại: " + request.getCode(), HttpStatus.BAD_REQUEST);
        }

        warehouseMapper.updateWarehouseFromRequest(request, warehouse);
        if (request.getIsActive() != null) {
            warehouse.setActive(request.getIsActive());
        }

        warehouse = warehouseRepository.save(warehouse);

        auditLogService.log("UPDATE_WAREHOUSE", SecurityUtils.getCurrentUsername(), "Updated warehouse: " + warehouse.getName() + " (" + warehouse.getCode() + ")");

        return warehouseMapper.toResponse(warehouse);
    }

    @Override
    public WarehouseResponse getWarehouseById(String id) {
        Warehouse warehouse = warehouseRepository.findById(java.util.UUID.fromString(id))
                .orElseThrow(() -> new AppException("WAREHOUSE_NOT_FOUND", "Không tìm thấy kho hàng với ID: " + id, HttpStatus.NOT_FOUND));
        
        return warehouseMapper.toResponse(warehouse);
    }

    @Override
    public PageResponse<WarehouseResponse> getAllWarehouses(WarehouseFilterRequest filter, Pageable pageable) {
        Pageable finalPageable = PaginationUtils.applyStableSort(pageable, 
                Sort.Order.desc("createdAt"), 
                Sort.Order.asc("id"));

        Specification<Warehouse> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter != null) {
                if (StringUtils.hasText(filter.getId())) {
                    try {
                        predicates.add(cb.equal(root.get("id"), java.util.UUID.fromString(filter.getId())));
                    } catch (IllegalArgumentException e) {
                        // Ignore invalid UUID string
                    }
                }

                if (StringUtils.hasText(filter.getKeyword())) {
                    String searchPattern = "%" + filter.getKeyword().toLowerCase() + "%";
                    predicates.add(cb.or(
                            cb.like(cb.lower(root.get("name")), searchPattern),
                            cb.like(cb.lower(root.get("code")), searchPattern),
                            cb.like(cb.lower(root.get("address")), searchPattern)
                    ));
                }

                if (StringUtils.hasText(filter.getCode())) {
                    predicates.add(cb.equal(root.get("code"), filter.getCode()));
                }

                if (StringUtils.hasText(filter.getName())) {
                    predicates.add(cb.like(cb.lower(root.get("name")), "%" + filter.getName().toLowerCase() + "%"));
                }

                if (filter.getActive() != null) {
                    predicates.add(cb.equal(root.get("active"), filter.getActive()));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Warehouse> warehousePage = warehouseRepository.findAll(spec, finalPageable);
        return warehouseMapper.toPageResponse(warehousePage);
    }

    @Override
    @Transactional
    public void deleteWarehouse(String id) {
        Warehouse warehouse = warehouseRepository.findById(java.util.UUID.fromString(id))
                .orElseThrow(() -> new AppException("WAREHOUSE_NOT_FOUND", "Không tìm thấy kho hàng với ID: " + id, HttpStatus.NOT_FOUND));

        warehouseRepository.delete(warehouse);

        auditLogService.log("DELETE_WAREHOUSE", SecurityUtils.getCurrentUsername(), "Deleted warehouse: " + warehouse.getName() + " (" + warehouse.getCode() + ")");
    }
}
