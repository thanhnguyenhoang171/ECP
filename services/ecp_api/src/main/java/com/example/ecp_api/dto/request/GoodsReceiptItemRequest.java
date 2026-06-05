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
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request object for adding or updating an item in a goods receipt")
public class GoodsReceiptItemRequest {

    @NotBlank(message = "Receipt ID is required")
    @Schema(description = "ID of the parent goods receipt", example = "550e8400-e29b-41d4-a716-446655440000")
    private String receiptId;

    @NotBlank(message = "SKU ID is required")
    @Schema(description = "ID of the SKU to be received", example = "550e8400-e29b-41d4-a716-446655440000")
    private String skuId;

    @Schema(description = "Batch code for tracking", example = "LOHANG_052026")
    private String batchCode;

    @Schema(description = "Manufacture date of the item")
    private LocalDateTime manufactureDate;

    @Schema(description = "Expiry date of the item")
    private LocalDateTime expiryDate;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    @Schema(description = "Quantity received", example = "50")
    private Integer quantity;

    @NotNull(message = "Unit cost is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Unit cost must be at least 0")
    @Schema(description = "Cost per unit at the time of receipt", example = "120000.00")
    private BigDecimal unitCost;
}
