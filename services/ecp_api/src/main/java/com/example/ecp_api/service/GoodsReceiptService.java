package com.example.ecp_api.service;

import com.example.ecp_api.dto.request.GoodsReceiptFilterRequest;
import com.example.ecp_api.dto.request.GoodsReceiptRequest;
import com.example.ecp_api.dto.response.GoodsReceiptAdminResponse;
import com.example.ecp_api.dto.response.GoodsReceiptResponse;
import com.example.ecp_api.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

public interface GoodsReceiptService {
    GoodsReceiptResponse createGoodsReceipt(GoodsReceiptRequest request);
    GoodsReceiptAdminResponse createGoodsReceiptAdmin(GoodsReceiptRequest request);
    GoodsReceiptResponse updateGoodsReceipt(String id, GoodsReceiptRequest request);
    GoodsReceiptAdminResponse updateGoodsReceiptAdmin(String id, GoodsReceiptRequest request);
    GoodsReceiptResponse getGoodsReceiptById(String id);
    GoodsReceiptAdminResponse getGoodsReceiptByIdAdmin(String id);
    PageResponse<GoodsReceiptResponse> getAllGoodsReceipts(GoodsReceiptFilterRequest filter, Pageable pageable);
    PageResponse<GoodsReceiptAdminResponse> getAllGoodsReceiptsAdmin(GoodsReceiptFilterRequest filter, Pageable pageable);
    void deleteGoodsReceipt(String id);
    GoodsReceiptResponse confirmReceipt(String id);
    GoodsReceiptAdminResponse confirmReceiptAdmin(String id);
}
