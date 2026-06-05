package com.example.ecp_api.service;

import com.example.ecp_api.dto.request.SkuFilterRequest;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.SkuResponse;
import org.springframework.data.domain.Pageable;

public interface SkuService {
    PageResponse<SkuResponse> getAllSkus(SkuFilterRequest filter, Pageable pageable);
}
