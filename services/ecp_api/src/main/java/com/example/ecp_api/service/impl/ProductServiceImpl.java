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
      return null;
    }


    @Override
    public PageResponse<ProductResponse> getAllProducts(ProductFilterRequest filter, Pageable pageable) {
       return null;
    }
}
