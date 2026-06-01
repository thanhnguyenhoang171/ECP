package com.example.ecp_api.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
public class InventoryFilterRequest {
    @Schema(description = "Filter by Warehouse ID")
    private String warehouseId;

    @Schema(description = "Filter by SKU ID")
    private String skuId;

    @Schema(description = "Filter by Batch Code")
    private String batchCode;

    @Schema(description = "Filter by SKU Code")
    private String skuCode;

    @Schema(description = "Filter by Product Name")
    private String productName;
}
