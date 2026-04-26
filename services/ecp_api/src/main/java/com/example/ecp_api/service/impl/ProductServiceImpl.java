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
        if (productRepository.existsBySku(request.getSku())) {
            throw new AppException("Product with SKU already exists", HttpStatus.BAD_REQUEST);
        }
        if (productRepository.existsBySlug(request.getSlug())) {
            throw new AppException("Product with Slug already exists", HttpStatus.BAD_REQUEST);
        }

        Product product = productMapper.toEntity(request);
        
        // Manual mapping for fields needing custom logic or default values
        product.setPublished(request.getIsPublished() != null && request.getIsPublished());
        
        if (product.getVariants() != null && !product.getVariants().isEmpty()) {
            int totalStock = 0;
            for (int i = 0; i < product.getVariants().size(); i++) {
                ProductVariant variant = product.getVariants().get(i);
                ProductRequest.ProductVariantRequest variantRequest = request.getVariants().get(i);
                
                variant.setId(UUID.randomUUID().toString());
                variant.setActive(variantRequest.getIsActive() == null || variantRequest.getIsActive());
                totalStock += variant.getStock();
            }
            product.setTotalStock(totalStock);
        }

        Product savedProduct = productRepository.save(product);
        return productMapper.toResponse(savedProduct);
    }


    @Override
    public PageResponse<ProductResponse> getAllProducts(ProductFilterRequest filter, Pageable pageable) {
        Query query = new Query().with(pageable);

        if (StringUtils.hasText(filter.getName())) {
            query.addCriteria(Criteria.where("name").regex(filter.getName(), "i"));
        }
        if (StringUtils.hasText(filter.getSku())) {
            query.addCriteria(Criteria.where("sku").is(filter.getSku()));
        }
        if (StringUtils.hasText(filter.getCategoryId())) {
            query.addCriteria(Criteria.where("categoryId").is(filter.getCategoryId()));
        }
        if (StringUtils.hasText(filter.getBrand())) {
            query.addCriteria(Criteria.where("brand").is(filter.getBrand()));
        }
        if (filter.getIsPublished() != null) {
            query.addCriteria(Criteria.where("is_published").is(filter.getIsPublished()));
        }

        // Exclude deleted items
        query.addCriteria(Criteria.where("is_deleted").is(false));

        long count = mongoTemplate.count(Query.of(query).limit(-1).skip(-1), Product.class);
        List<Product> products = mongoTemplate.find(query, Product.class);

        Page<Product> productPage = new PageImpl<>(products, pageable, count);
        return productMapper.toPageResponse(productPage);
    }
}
