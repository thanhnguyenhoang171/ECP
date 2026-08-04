package com.example.ecp_api.service.impl;

import com.example.ecp_api.dto.request.SkuFilterRequest;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.SkuAdminResponse;
import com.example.ecp_api.dto.response.SkuResponse;
import com.example.ecp_api.entity.jpa.Sku;
import com.example.ecp_api.exception.ResourceNotFoundException;
import com.example.ecp_api.mapper.SkuMapper;
import com.example.ecp_api.repository.jpa.SkuRepository;
import com.example.ecp_api.service.SkuService;
import com.example.ecp_api.util.PaginationUtils;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SkuServiceImpl implements SkuService {

    private final SkuRepository skuRepository;
    private final SkuMapper skuMapper;

    private Specification<Sku> buildSpec(SkuFilterRequest filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (StringUtils.hasText(filter.getSkuCode())) {
                predicates.add(cb.equal(root.get("skuCode"), filter.getSkuCode()));
            }
            if (StringUtils.hasText(filter.getProductId())) {
                predicates.add(cb.equal(root.get("productId"), filter.getProductId()));
            }
            if (StringUtils.hasText(filter.getProductName())) {
                predicates.add(cb.like(cb.lower(root.get("productName")), "%" + filter.getProductName().toLowerCase() + "%"));
            }
            if (filter.getActive() != null) {
                predicates.add(cb.equal(root.get("active"), filter.getActive()));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private Sku findSku(String skuId) {
        UUID uuid;
        try {
            uuid = UUID.fromString(skuId);
        } catch (IllegalArgumentException e) {
            throw new ResourceNotFoundException("SKU not found with ID: " + skuId, "SKU_NOT_FOUND");
        }
        return skuRepository.findById(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("SKU not found with ID: " + skuId, "SKU_NOT_FOUND"));
    }

    // ─────────────────────────── MANAGER METHODS ───────────────────────────

    @Override
    public PageResponse<SkuResponse> getAllSkus(SkuFilterRequest filter, Pageable pageable) {
        Pageable finalPageable = PaginationUtils.applyStableSort(pageable,
                Sort.Order.desc("createdAt"), Sort.Order.asc("id"));
        Page<Sku> skuPage = skuRepository.findAll(buildSpec(filter), finalPageable);
        return skuMapper.toPageResponse(skuPage);
    }

    @Override
    public SkuResponse getSkuById(String skuId) {
        return skuMapper.toResponse(findSku(skuId));
    }

    // ─────────────────────────── ADMIN METHODS ───────────────────────────

    @Override
    public PageResponse<SkuAdminResponse> getAllSkusAdmin(SkuFilterRequest filter, Pageable pageable) {
        Pageable finalPageable = PaginationUtils.applyStableSort(pageable,
                Sort.Order.desc("createdAt"), Sort.Order.asc("id"));
        Page<Sku> skuPage = skuRepository.findAll(buildSpec(filter), finalPageable);
        return skuMapper.toAdminPageResponse(skuPage);
    }

    @Override
    public SkuAdminResponse getSkuByIdAdmin(String skuId) {
        return skuMapper.toAdminResponse(findSku(skuId));
    }
}
