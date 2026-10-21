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
    private String productId;

    @jakarta.validation.constraints.Size(max = 200)
    private String keyword;

    @jakarta.validation.constraints.Pattern(regexp = "all|low|out|ok", message = "Invalid stock status")
    private String stockStatus;
}
