package com.example.ecp_api.service;

import com.example.ecp_api.dto.request.GoodsReceiptRequest;
import com.example.ecp_api.dto.response.GoodsReceiptResponse;
import com.example.ecp_api.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

public interface GoodsReceiptService {
    GoodsReceiptResponse createGoodsReceipt(GoodsReceiptRequest request);
    GoodsReceiptResponse updateGoodsReceipt(String id, GoodsReceiptRequest request);
    GoodsReceiptResponse getGoodsReceiptById(String id);
    PageResponse<GoodsReceiptResponse> getAllGoodsReceipts(com.example.ecp_api.dto.request.GoodsReceiptFilterRequest filter, org.springframework.data.domain.Pageable pageable);
    void deleteGoodsReceipt(String id);
    GoodsReceiptResponse confirmReceipt(String id);
}
