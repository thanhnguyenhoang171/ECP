package com.example.ecp_api.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request object for creating or updating a purchase order item")
public class PurchaseOrderItemRequest {

    @NotBlank(message = "Purchase order ID is required")
    @Schema(description = "ID of the parent purchase order", example = "550e8400-e29b-41d4-a716-446655440000", requiredMode = Schema.RequiredMode.REQUIRED)
    private String purchaseOrderId;

    @NotBlank(message = "SKU ID is required")
    @Schema(description = "ID of the associated SKU", example = "550e8400-e29b-41d4-a716-446655440000", requiredMode = Schema.RequiredMode.REQUIRED)
    private String skuId;

    @NotNull(message = "Unit price is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Unit price must be greater than or equal to 0")
    @Schema(description = "Price per unit of the item", example = "150000.00", requiredMode = Schema.RequiredMode.REQUIRED)
    private BigDecimal unitPrice;

    @NotNull(message = "Order quantity is required")
    @Min(value = 1, message = "Order quantity must be at least 1")
    @Schema(description = "Quantity of units ordered", example = "100", requiredMode = Schema.RequiredMode.REQUIRED)
    private Integer orderQuantity;

    @Schema(description = "Quantity of units received so far", example = "0")
    private Integer receivedQuantity;
}
