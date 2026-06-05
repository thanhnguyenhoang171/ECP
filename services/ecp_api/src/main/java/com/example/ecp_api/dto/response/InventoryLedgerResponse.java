package com.example.ecp_api.dto.response;

import com.example.ecp_api.enums.common.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryLedgerResponse {
    private UUID id;
    private String warehouseName;
    private String skuCode;
    private String batchCode;
    private TransactionType transactionType;
    private Integer quantityChange;
    private Integer balanceAfter;
    private String referenceId;
    private String referenceType;
    private String note;
    private LocalDateTime createdAt;
}
