package com.example.ecp_api.dto.request;

import com.example.ecp_api.enums.common.PurchaseOrderStatus;
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
@Schema(description = "Request object for creating or updating a purchase order")
public class PurchaseOrderRequest {

    @NotBlank(message = "Purchase order code is required")
    @Schema(description = "Unique code of the purchase order", example = "PO-20260529-001", requiredMode = Schema.RequiredMode.REQUIRED)
    private String poCode;

    @NotBlank(message = "Warehouse ID is required")
    @Schema(description = "ID of the warehouse", example = "550e8400-e29b-41d4-a716-446655440000", requiredMode = Schema.RequiredMode.REQUIRED)
    private String warehouseId;

    @NotBlank(message = "Supplier ID is required")
    @Schema(description = "ID of the supplier", example = "550e8400-e29b-41d4-a716-446655440000", requiredMode = Schema.RequiredMode.REQUIRED)
    private String supplierId;

    @Schema(description = "Status of the purchase order", example = "DRAFT")
    private PurchaseOrderStatus status;

    @Schema(description = "Optional notes or comments about the purchase order", example = "Giao hàng vào giờ hành chính")
    private String note;
}
