package com.example.ecp_api.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
public class GoodsReceiptItemFilterRequest {
    @Schema(description = "Filter by Receipt ID")
    private String receiptId;

    @Schema(description = "Filter by SKU ID")
    private String skuId;

    @Schema(description = "Filter by Batch Code")
    private String batchCode;
}
