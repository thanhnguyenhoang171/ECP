package com.example.ecp_api.dto.response;

import com.example.ecp_api.enums.common.ReceiptStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response object representing a goods receipt (Admin view with full audit info)")
public class GoodsReceiptAdminResponse {

    private UUID id;
    private String receiptCode;
    private String code;
    private UUID purchaseOrderId;
    private String purchaseOrderCode;
    private UUID warehouseId;
    private String warehouseCode;
    private String warehouseName;
    private ReceiptStatus status;
    private String note;
    private List<GoodsReceiptItemResponse> items;
    private LocalDateTime createdAt;
    private LocalDateTime receivedAt;
    private String createdBy;
    private String updatedBy;
}
