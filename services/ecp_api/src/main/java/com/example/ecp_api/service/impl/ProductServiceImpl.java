package com.example.ecp_api.service.impl;

import com.example.ecp_api.dto.request.ProductFilterRequest;
import com.example.ecp_api.dto.request.ProductRequest;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.ProductResponse;
import com.example.ecp_api.entity.jpa.Sku;
import com.example.ecp_api.entity.mongodb.Product;

import com.example.ecp_api.entity.mongodb.embedded.ProductVariant;
import com.example.ecp_api.exception.AppException;
import com.example.ecp_api.exception.ResourceNotFoundException;
import com.example.ecp_api.mapper.ProductMapper;
import com.example.ecp_api.repository.jpa.SkuRepository;
import com.example.ecp_api.repository.mongodb.CategoryRepository;
import com.example.ecp_api.repository.mongodb.ProductRepository;
import com.example.ecp_api.service.AuditLogService;
import com.example.ecp_api.service.ProductService;
import com.example.ecp_api.util.PaginationUtils;
import com.example.ecp_api.util.ProductUtils;
import com.example.ecp_api.util.SecurityUtils;
import com.example.ecp_api.util.SlugUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final MongoTemplate mongoTemplate;
    private final CategoryRepository categoryRepository;
    private final SkuRepository skuRepository;
    private final AuditLogService auditLogService;


    @Override
    public PageResponse<ProductResponse> getAllProducts(ProductFilterRequest filter, Pageable pageable) {
        Pageable finalPageable = PaginationUtils.applyStableSort(pageable, 
                Sort.Order.desc("createdAt"), 
                Sort.Order.asc("id"));

        Query query = new Query().with(finalPageable);

        if (StringUtils.hasText(filter.getId())) {
            query.addCriteria(Criteria.where("_id").is(filter.getId()));
        }
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

        // Loại bỏ các sản phẩm đã xóa (Soft Delete)
        query.addCriteria(Criteria.where("is_deleted").is(false));

        long count = mongoTemplate.count(Query.of(query).limit(-1).skip(-1), Product.class);
        List<Product> products = mongoTemplate.find(query, Product.class);

        Page<Product> productPage = new PageImpl<>(products, finalPageable, count);
        return productMapper.toPageResponse(productPage);
    }

//    TODO: Implement API create a new product
    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        // Validate Category
        if (StringUtils.hasText(request.getCategoryId())) {
            categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category Not Found", "CATEGORY_NOT_FOUND"));
        }

        // Handle SKU (Auto-generate if empty)
        String finalSku = request.getSku();
        if (!StringUtils.hasText(finalSku)) {
            finalSku = ProductUtils.generateSku(request.getBrand(), request.getName());
        }

        // Handle Slug (Auto-generate if empty)
        String finalSlug = request.getSlug();
        if (!StringUtils.hasText(finalSlug)) {
            finalSlug = SlugUtils.toSlug(request.getName());
        }

        // Validate SKU uniqueness
        if (productRepository.existsBySku(finalSku) || skuRepository.existsBySkuCode(finalSku)) {
            throw new AppException("SKU_EXISTS", "Mã SKU sản phẩm đã tồn tại: " + finalSku, HttpStatus.BAD_REQUEST);
        }
        
        // Map and save Product Master (MongoDB)
        Product product = productMapper.toEntity(request);
        product.setSku(finalSku);
        product.setSlug(finalSlug);

        product.setPublished(request.getIsPublished() != null ? request.getIsPublished() : false);

        product = productRepository.save(product); // Temp storage to get ID

        final String finalProductId = product.getId();
        final String productName = product.getName();

        // Handle Variants and create Sku in MySQL
        final String productSku = product.getSku();
        List<ProductVariant> variants = request.getVariants().stream().map(vReq -> {
            String vSku = vReq.getSku();
            if (!StringUtils.hasText(vSku)) {
                vSku = ProductUtils.generateVariantSku(productSku, vReq.getAttributes());
            }

            // Check SKU of Variant
            if (skuRepository.existsBySkuCode(vSku)) {
                throw new AppException("VARIANT_SKU_EXIST", "Mã SKU biến thể đã tồn tại: " + vSku, HttpStatus.BAD_REQUEST);
            }
            // Create Sku Entity (MySQL)
            String vName = vReq.getAttributes() != null 
                    ? String.join(" / ", vReq.getAttributes().values().stream().map(Object::toString).toList())
                    : "";

            Sku skuEntity = Sku.builder()
                    .skuCode(vSku)
                    .barcode(vReq.getBarcode())
                    .barcodeType(vReq.getBarcodeType())
                    .productId(finalProductId)
                    .productName(productName)
                    .variantName(vName)
                    .active(vReq.getIsActive() != null ? vReq.getIsActive() : true)
                    .variantId(UUID.randomUUID().toString())
                    .build();

            skuEntity = skuRepository.save(skuEntity);

            // Map to ProductVariant (Embedded Mongo)
            ProductVariant variant = productMapper.toVariantEntity(vReq);
            variant.setSku(vSku);
            variant.setProductId(finalProductId);
            variant.setSku_id(skuEntity.getId().toString());
            variant.setBarcodeType(vReq.getBarcodeType());
            variant.setImage(productMapper.toProductImage(vReq.getImage()));
            return variant;
        }).toList();

        // Update Product with full variants list
        product.setVariants(variants);
        product = productRepository.save(product);

        auditLogService.log("CREATE_PRODUCT", SecurityUtils.getCurrentUsername(), "Created product: " + product.getName());

        return productMapper.toResponse(product);
    }
}
