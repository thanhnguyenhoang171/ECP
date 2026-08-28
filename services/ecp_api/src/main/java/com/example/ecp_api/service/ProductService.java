package com.example.ecp_api.service;

import com.example.ecp_api.dto.request.ProductFilterRequest;
import com.example.ecp_api.dto.request.ProductRequest;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.ProductResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface ProductService {
    ProductResponse createProduct(ProductRequest request);
    ProductResponse createProduct(ProductRequest request, MultipartFile thumbnailFile, List<MultipartFile> imageFiles);

    PageResponse<ProductResponse> getAllProducts(ProductFilterRequest filter, Pageable pageable);

    ProductResponse getProductById(String id);

    ProductResponse updateProduct(String id, ProductRequest request);

    void deleteProduct(String id);

    void updateVariantCostPriceMAC(String skuId, int addedQuantity, java.math.BigDecimal newUnitCost);
}

