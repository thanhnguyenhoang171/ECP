package com.example.ecp_api.service;

import com.example.ecp_api.dto.request.WarehouseFilterRequest;
import com.example.ecp_api.dto.request.WarehouseRequest;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.WarehouseResponse;
import org.springframework.data.domain.Pageable;

public interface WarehouseService {
    WarehouseResponse createWarehouse(WarehouseRequest request);
    WarehouseResponse updateWarehouse(String id, WarehouseRequest request);
    WarehouseResponse getWarehouseById(String id);
    PageResponse<WarehouseResponse> getAllWarehouses(WarehouseFilterRequest filter, Pageable pageable);
    void deleteWarehouse(String id);
}
