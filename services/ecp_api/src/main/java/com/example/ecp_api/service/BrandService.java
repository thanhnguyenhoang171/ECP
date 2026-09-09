package com.example.ecp_api.service;

import com.example.ecp_api.dto.request.BrandFilterRequest;
import com.example.ecp_api.dto.request.BrandRequest;
import com.example.ecp_api.dto.response.BrandResponse;
import com.example.ecp_api.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.io.OutputStream;
import java.util.List;

public interface BrandService {
    default BrandResponse createBrand(BrandRequest request) {
        return createBrand(request, null);
    }

    BrandResponse createBrand(BrandRequest request, MultipartFile logoFile);

    PageResponse<BrandResponse> getAllBrands(BrandFilterRequest filter, Pageable pageable);

    BrandResponse getBrandById(String id);

    List<BrandResponse> getActiveBrands();

    default BrandResponse updateBrand(String id, BrandRequest request) {
        return updateBrand(id, request, null);
    }

    BrandResponse updateBrand(String id, BrandRequest request, MultipartFile logoFile);

    void deleteBrand(String id);

    void downloadBrandTemplate(OutputStream outputStream);

    void importBrandsFromExcel(MultipartFile file);

    void exportAllBrandsToExcel(OutputStream outputStream);
}
