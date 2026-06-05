package com.example.ecp_api.service;

import com.example.ecp_api.dto.request.PurchaseOrderItemFilterRequest;
import com.example.ecp_api.dto.request.PurchaseOrderItemRequest;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.PurchaseOrderItemAdminResponse;
import com.example.ecp_api.dto.response.PurchaseOrderItemResponse;
import org.springframework.data.domain.Pageable;

public interface PurchaseOrderItemService {
    PurchaseOrderItemResponse createPurchaseOrderItem(PurchaseOrderItemRequest request);
    PurchaseOrderItemResponse updatePurchaseOrderItem(String id, PurchaseOrderItemRequest request);
    PurchaseOrderItemResponse getPurchaseOrderItemById(String id);
    PurchaseOrderItemAdminResponse getPurchaseOrderItemByIdAdmin(String id);
    PageResponse<PurchaseOrderItemResponse> getAllPurchaseOrderItems(PurchaseOrderItemFilterRequest filter, Pageable pageable);
    PageResponse<PurchaseOrderItemAdminResponse> getAllPurchaseOrderItemsAdmin(PurchaseOrderItemFilterRequest filter, Pageable pageable);
    void deletePurchaseOrderItem(String id);
}
