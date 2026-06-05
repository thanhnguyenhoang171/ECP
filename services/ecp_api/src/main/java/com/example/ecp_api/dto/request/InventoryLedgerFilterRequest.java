package com.example.ecp_api.dto.request;

import com.example.ecp_api.enums.common.TransactionType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class InventoryLedgerFilterRequest {
    private String warehouseId;
    private String skuId;
    private String batchCode;
    private TransactionType transactionType;
    private String referenceId;
    private String referenceType;
    private LocalDateTime fromDate;
    private LocalDateTime toDate;
}
