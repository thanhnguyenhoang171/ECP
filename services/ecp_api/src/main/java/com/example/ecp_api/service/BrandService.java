package com.example.ecp_api.service;

import com.example.ecp_api.dto.request.BrandFilterRequest;
import com.example.ecp_api.dto.request.BrandRequest;
import com.example.ecp_api.dto.response.BrandResponse;
import com.example.ecp_api.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BrandService {
    BrandResponse createBrand(BrandRequest request);
    PageResponse<BrandResponse> getAllBrands(BrandFilterRequest filter, Pageable pageable);
    BrandResponse getBrandById(String id);
    List<BrandResponse> getActiveBrands();
    BrandResponse updateBrand(String id, BrandRequest request);
    void deleteBrand(String id);
}
