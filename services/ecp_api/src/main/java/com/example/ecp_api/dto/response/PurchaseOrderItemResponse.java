package com.example.ecp_api.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response object representing a purchase order item details")
public class PurchaseOrderItemResponse {

    @Schema(description = "Unique ID of the purchase order item (UUID)", example = "550e8400-e29b-41d4-a716-446655440000")
    private UUID id;

    @Schema(description = "ID of the parent purchase order", example = "550e8400-e29b-41d4-a716-446655440000")
    private UUID purchaseOrderId;

    @Schema(description = "Code of the parent purchase order", example = "PO-20260529-001")
    private String purchaseOrderCode;

    @Schema(description = "ID of the associated SKU", example = "550e8400-e29b-41d4-a716-446655440000")
    private UUID skuId;

    @Schema(description = "Associated SKU code", example = "APPLE-IP15-A1B2")
    private String skuCode;

    @Schema(description = "Product name of the associated SKU", example = "iPhone 15 Pro Max")
    private String productName;

    @Schema(description = "Variant name of the associated SKU", example = "Titanium Grey - 256GB")
    private String variantName;

    @Schema(description = "Price per unit of the item")
    private BigDecimal unitPrice;

    @Schema(description = "Quantity of units ordered")
    private Integer orderQuantity;

    @Schema(description = "Quantity of units received so far")
    private Integer receivedQuantity;

    @Schema(description = "Timestamp when the item was added to the PO")
    private LocalDateTime createdAt;

    @Schema(description = "Timestamp of the last update to the item")
    private LocalDateTime updatedAt;
}
