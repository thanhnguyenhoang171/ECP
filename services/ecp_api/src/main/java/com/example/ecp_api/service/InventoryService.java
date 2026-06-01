package com.example.ecp_api.service;

import com.example.ecp_api.dto.request.InventoryAdjustmentRequest;
import com.example.ecp_api.dto.request.InventoryFilterRequest;
import com.example.ecp_api.dto.request.InventoryLedgerFilterRequest;
import com.example.ecp_api.dto.response.InventoryLedgerResponse;
import com.example.ecp_api.dto.response.InventoryResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.enums.common.TransactionType;

import java.util.List;

public interface InventoryService {
    InventoryResponse adjustInventory(InventoryAdjustmentRequest request, TransactionType type, String refId, String refType);
    InventoryResponse getInventoryById(String id);
    PageResponse<InventoryResponse> getAllInventory(InventoryFilterRequest filter, org.springframework.data.domain.Pageable pageable);
    void deleteInventory(String id);

    InventoryLedgerResponse getLedgerById(String id);
    PageResponse<InventoryLedgerResponse> getAllLedgers(InventoryLedgerFilterRequest filter, org.springframework.data.domain.Pageable pageable);
    List<InventoryLedgerResponse> getHistory(String warehouseId, String skuId, String batchCode);
}
