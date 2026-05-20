package com.example.ecp_api.service.impl;

import com.example.ecp_api.dto.request.ProductFilterRequest;
import com.example.ecp_api.dto.request.ProductRequest;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.ProductResponse;
import com.example.ecp_api.entity.mongodb.Product;

import com.example.ecp_api.entity.mongodb.embedded.ProductVariant;
import com.example.ecp_api.exception.AppException;
import com.example.ecp_api.mapper.ProductMapper;
import com.example.ecp_api.repository.mongodb.ProductRepository;
import com.example.ecp_api.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final MongoTemplate mongoTemplate;

    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
      return null;
    }


    @Override
    public PageResponse<ProductResponse> getAllProducts(ProductFilterRequest filter, Pageable pageable) {
        // Đảm bảo luôn có sort ổn định để tránh trùng lặp dữ liệu giữa các trang (Stable Sorting)
        Sort sort = pageable.getSort();
        if (sort.isUnsorted()) {
            sort = Sort.by(Sort.Direction.DESC, "createdAt");
        }
        // Thêm tie-breaker bằng id
        sort = sort.and(Sort.by(Sort.Direction.ASC, "id"));

        Query query = new Query().with(pageable).with(sort);

        if (StringUtils.hasText(filter.getName())) {
            query.addCriteria(Criteria.where("name").regex(filter.getName(), "i"));
        }
        if (StringUtils.hasText(filter.getSku())) {
            query.addCriteria(Criteria.where("sku").regex(filter.getSku(), "i"));
        }
        if (StringUtils.hasText(filter.getCategoryId())) {
            query.addCriteria(Criteria.where("category_id").is(filter.getCategoryId()));
        }
        if (StringUtils.hasText(filter.getBrand())) {
            query.addCriteria(Criteria.where("brand").is(filter.getBrand()));
        }
        if (filter.getIsPublished() != null) {
            query.addCriteria(Criteria.where("is_published").is(filter.getIsPublished()));
        }

        // Loại bỏ các sản phẩm đã xóa
        query.addCriteria(Criteria.where("is_deleted").is(false));

        long count = mongoTemplate.count(Query.of(query).limit(-1).skip(-1), Product.class);
        List<Product> products = mongoTemplate.find(query, Product.class);

        Page<Product> productPage = new PageImpl<>(products, pageable, count);
        return productMapper.toPageResponse(productPage);
    }
}
