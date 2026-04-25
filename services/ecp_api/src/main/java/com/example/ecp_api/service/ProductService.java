package com.example.ecp_api.service;

import com.example.ecp_api.dto.request.ProductRequest;
import com.example.ecp_api.dto.response.ProductResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductService {
    ProductResponse createProduct(ProductRequest request);
    Page<ProductResponse> getAllProducts(Pageable pageable);
}
