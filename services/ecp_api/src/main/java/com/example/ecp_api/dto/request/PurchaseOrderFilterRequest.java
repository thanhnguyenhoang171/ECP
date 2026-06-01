package com.example.ecp_api.dto.request;

import com.example.ecp_api.enums.common.PurchaseOrderStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Filter object for querying purchase orders with pagination")
public class PurchaseOrderFilterRequest {

    @Schema(description = "Search keyword matches with PO code or note", example = "PO-2026")
    private String keyword;

    @Schema(description = "Filter by warehouse ID", example = "550e8400-e29b-41d4-a716-446655440000")
    private String warehouseId;

    @Schema(description = "Filter by supplier ID", example = "550e8400-e29b-41d4-a716-446655440000")
    private String supplierId;

    @Schema(description = "Filter by purchase order status", example = "DRAFT")
    private PurchaseOrderStatus status;
}
