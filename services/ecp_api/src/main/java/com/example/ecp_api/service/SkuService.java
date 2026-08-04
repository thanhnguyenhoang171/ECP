package com.example.ecp_api.service;

import com.example.ecp_api.dto.request.SkuFilterRequest;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.SkuAdminResponse;
import com.example.ecp_api.dto.response.SkuResponse;
import org.springframework.data.domain.Pageable;

public interface SkuService {
    // Manager methods (no createdBy/updatedBy)
    PageResponse<SkuResponse> getAllSkus(SkuFilterRequest filter, Pageable pageable);
    SkuResponse getSkuById(String skuId);

    // Admin methods (includes createdBy/updatedBy)
    PageResponse<SkuAdminResponse> getAllSkusAdmin(SkuFilterRequest filter, Pageable pageable);
    SkuAdminResponse getSkuByIdAdmin(String skuId);
}
