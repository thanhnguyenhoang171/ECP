package com.example.ecp_api.service;

import com.example.ecp_api.dto.request.GoodsReceiptItemRequest;
import com.example.ecp_api.dto.response.GoodsReceiptItemResponse;
import com.example.ecp_api.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface GoodsReceiptItemService {
    GoodsReceiptItemResponse addItemToReceipt(GoodsReceiptItemRequest request);
    List<GoodsReceiptItemResponse> addItemsToReceipt(List<GoodsReceiptItemRequest> requests);
    GoodsReceiptItemResponse updateItem(String id, GoodsReceiptItemRequest request);
    GoodsReceiptItemResponse getItemById(String id);
    List<GoodsReceiptItemResponse> getItemsByReceiptId(String receiptId);
    PageResponse<GoodsReceiptItemResponse> getAllItems(com.example.ecp_api.dto.request.GoodsReceiptItemFilterRequest filter, org.springframework.data.domain.Pageable pageable);
    void deleteItem(String id);
}
