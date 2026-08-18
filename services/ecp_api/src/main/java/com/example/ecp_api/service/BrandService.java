package com.example.ecp_api.service;

import com.example.ecp_api.dto.request.BrandFilterRequest;
import com.example.ecp_api.dto.request.BrandRequest;
import com.example.ecp_api.dto.response.BrandAdminResponse;
import com.example.ecp_api.dto.response.BrandResponse;
import com.example.ecp_api.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BrandService {
    BrandResponse createBrand(BrandRequest request);
    BrandResponse createBrand(BrandRequest request, org.springframework.web.multipart.MultipartFile logoFile);
    PageResponse<BrandResponse> getAllBrands(BrandFilterRequest filter, Pageable pageable);
    BrandResponse getBrandById(String id);
    List<BrandResponse> getActiveBrands();
    BrandResponse updateBrand(String id, BrandRequest request);
    BrandResponse updateBrand(String id, BrandRequest request, org.springframework.web.multipart.MultipartFile logoFile);
    void deleteBrand(String id);

    // Admin methods (includes createdBy/updatedBy in response)
    BrandAdminResponse createBrandAdmin(BrandRequest request);
    BrandAdminResponse createBrandAdmin(BrandRequest request, org.springframework.web.multipart.MultipartFile logoFile);
    PageResponse<BrandAdminResponse> getAllBrandsAdmin(BrandFilterRequest filter, Pageable pageable);
    BrandAdminResponse getBrandByIdAdmin(String id);
    List<BrandAdminResponse> getActiveBrandsAdmin();
    BrandAdminResponse updateBrandAdmin(String id, BrandRequest request);
    BrandAdminResponse updateBrandAdmin(String id, BrandRequest request, org.springframework.web.multipart.MultipartFile logoFile);
}
