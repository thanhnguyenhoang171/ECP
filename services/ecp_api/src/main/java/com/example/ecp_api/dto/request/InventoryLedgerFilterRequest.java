package com.example.ecp_api.dto.request;

import com.example.ecp_api.enums.common.TransactionType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Schema(description = "Filter parameters for inventory audit ledgers")
public class InventoryLedgerFilterRequest {
    @Schema(description = "Warehouse ID", example = "550e8400-e29b-41d4-a716-446655440000")
    private String warehouseId;

    @Schema(description = "SKU ID", example = "65f1a2b3c4d5e6f7a8b9c0d1")
    private String skuId;

    @Schema(description = "Batch code", example = "BATCH-2026-001")
    private String batchCode;

    @Schema(description = "Transaction type (IMPORT, EXPORT, ADJUSTMENT, TRANSFER, etc.)", example = "IMPORT")
    private TransactionType transactionType;

    @Schema(description = "Reference document ID (e.g. PO ID, Order ID)", example = "PO-2026-001")
    private String referenceId;

    @Schema(description = "Reference document type (PURCHASE_ORDER, SALES_ORDER, etc.)", example = "PURCHASE_ORDER")
    private String referenceType;

    @Schema(description = "Start datetime filter", example = "2026-01-01T00:00:00")
    private LocalDateTime fromDate;

    @Schema(description = "End datetime filter", example = "2026-12-31T23:59:59")
    private LocalDateTime toDate;
}
