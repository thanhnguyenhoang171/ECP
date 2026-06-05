package com.example.ecp_api.dto.response;

import com.example.ecp_api.enums.common.PurchaseOrderStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response object representing a purchase order (Admin view with full audit info)")
public class PurchaseOrderAdminResponse {

    @Schema(description = "Unique ID of the purchase order (UUID)", example = "550e8400-e29b-41d4-a716-446655440000")
    private UUID id;

    @Schema(description = "Unique purchase order code", example = "PO-20260529-001")
    private String poCode;

    @Schema(description = "Business code of the purchase order (same as poCode)", example = "PO-20260529-001")
    private String code;

    @Schema(description = "Warehouse ID referenced by the purchase order", example = "550e8400-e29b-41d4-a716-446655440000")
    private UUID warehouseId;

    @Schema(description = "Warehouse code", example = "KHO-HCM-01")
    private String warehouseCode;

    @Schema(description = "Warehouse name", example = "Kho trung tâm TP.HCM")
    private String warehouseName;

    @Schema(description = "Supplier ID referenced by the purchase order", example = "550e8400-e29b-41d4-a716-446655440000")
    private UUID supplierId;

    @Schema(description = "Supplier name", example = "Công ty TNHH Cung cấp ABC")
    private String supplierName;

    @Schema(description = "Current status of the purchase order", example = "DRAFT")
    private PurchaseOrderStatus status;

    @Schema(description = "Notes or comments about the purchase order", example = "Giao hàng vào giờ hành chính")
    private String note;

    @Schema(description = "Timestamp when the purchase order was created")
    private LocalDateTime createdAt;

    @Schema(description = "Timestamp of the last update to the purchase order")
    private LocalDateTime updatedAt;

    @Schema(description = "Username of the creator")
    private String createdBy;

    @Schema(description = "Username of the last updater")
    private String updatedBy;
}
