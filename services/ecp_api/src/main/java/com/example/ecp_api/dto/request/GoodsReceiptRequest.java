package com.example.ecp_api.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request object for creating or updating a goods receipt")
public class GoodsReceiptRequest {

    @Schema(description = "Receipt code (leave blank for auto-generation)", example = "GR-20260601-001")
    private String receiptCode;

    @Schema(description = "ID of the associated Purchase Order", example = "550e8400-e29b-41d4-a716-446655440000")
    private String purchaseOrderId;

    @NotBlank(message = "Warehouse ID is required")
    @Schema(description = "ID of the destination warehouse", example = "550e8400-e29b-41d4-a716-446655440000", requiredMode = Schema.RequiredMode.REQUIRED)
    private String warehouseId;

    @Schema(description = "Note or description for the receipt", example = "Nhập kho đợt 1 cho đơn hàng iPhone 15")
    private String note;
}
