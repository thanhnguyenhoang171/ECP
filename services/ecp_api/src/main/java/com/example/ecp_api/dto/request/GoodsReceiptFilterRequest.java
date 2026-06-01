package com.example.ecp_api.dto.request;

import com.example.ecp_api.enums.common.ReceiptStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
public class GoodsReceiptFilterRequest {
    @Schema(description = "Filter by Receipt Code")
    private String receiptCode;

    @Schema(description = "Filter by Purchase Order ID")
    private String purchaseOrderId;

    @Schema(description = "Filter by Warehouse ID")
    private String warehouseId;

    @Schema(description = "Filter by Status")
    private ReceiptStatus status;
}
