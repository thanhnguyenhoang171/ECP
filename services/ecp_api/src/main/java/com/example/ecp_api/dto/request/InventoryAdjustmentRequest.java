package com.example.ecp_api.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request object for manual inventory adjustment")
public class InventoryAdjustmentRequest {

    @NotBlank(message = "Warehouse ID is required")
    private String warehouseId;

    @NotBlank(message = "SKU ID is required")
    private String skuId;

    private String batchCode;

    @NotNull(message = "Adjustment quantity is required")
    @Schema(description = "Positive to increase, negative to decrease stock")
    private Integer quantityChange;

    private String note;
}
