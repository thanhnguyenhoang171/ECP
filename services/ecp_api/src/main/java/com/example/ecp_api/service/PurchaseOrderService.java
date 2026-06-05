package com.example.ecp_api.service;

import com.example.ecp_api.dto.request.PurchaseOrderFilterRequest;
import com.example.ecp_api.dto.request.PurchaseOrderRequest;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.PurchaseOrderAdminResponse;
import com.example.ecp_api.dto.response.PurchaseOrderResponse;
import org.springframework.data.domain.Pageable;

public interface PurchaseOrderService {
    PurchaseOrderResponse createPurchaseOrder(PurchaseOrderRequest request);
    PurchaseOrderResponse updatePurchaseOrder(String id, PurchaseOrderRequest request);
    PurchaseOrderResponse getPurchaseOrderById(String id);
    PurchaseOrderAdminResponse getPurchaseOrderByIdAdmin(String id);
    PageResponse<PurchaseOrderResponse> getAllPurchaseOrders(PurchaseOrderFilterRequest filter, Pageable pageable);
    PageResponse<PurchaseOrderAdminResponse> getAllPurchaseOrdersAdmin(PurchaseOrderFilterRequest filter, Pageable pageable);
    void deletePurchaseOrder(String id);
}
