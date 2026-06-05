package com.example.ecp_api.service.impl;

import com.example.ecp_api.dto.request.SkuFilterRequest;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.SkuResponse;
import com.example.ecp_api.entity.jpa.Sku;
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

@Service
@RequiredArgsConstructor
public class SkuServiceImpl implements SkuService {

    private final SkuRepository skuRepository;
    private final SkuMapper skuMapper;

    @Override
    public PageResponse<SkuResponse> getAllSkus(SkuFilterRequest filter, Pageable pageable) {
        Pageable finalPageable = PaginationUtils.applyStableSort(pageable, 
                Sort.Order.desc("createdAt"), 
                Sort.Order.asc("id"));

        Specification<Sku> spec = (root, query, cb) -> {
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

        Page<Sku> skuPage = skuRepository.findAll(spec, finalPageable);
        return skuMapper.toPageResponse(skuPage);
    }
}
