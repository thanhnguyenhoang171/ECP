package com.example.ecp_api.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Filter object for querying purchase order items with pagination")
public class PurchaseOrderItemFilterRequest {

    @Schema(description = "Filter by parent purchase order ID", example = "550e8400-e29b-41d4-a716-446655440000")
    private String purchaseOrderId;

    @Schema(description = "Filter by associated SKU ID", example = "550e8400-e29b-41d4-a716-446655440000")
    private String skuId;
}
