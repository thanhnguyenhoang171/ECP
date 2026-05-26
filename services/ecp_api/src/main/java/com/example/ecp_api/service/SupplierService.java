package com.example.ecp_api.service;

import com.example.ecp_api.dto.request.SupplierRequest;
import com.example.ecp_api.dto.request.SupplierRequestFilter;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.SupplierResponse;
import org.springframework.data.domain.Pageable;

public interface SupplierService {
    SupplierResponse createSupplier(SupplierRequest request);
    SupplierResponse updateSupplier(String id, SupplierRequest request);
    SupplierResponse getSupplierById(String id);
    PageResponse<SupplierResponse> getAllSuppliers(SupplierRequestFilter filter, Pageable pageable);
    void deleteSupplier(String id);
}
