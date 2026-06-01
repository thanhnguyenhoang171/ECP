package com.example.ecp_api.dto.response;

import com.example.ecp_api.enums.common.ReceiptStatus;
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
@Schema(description = "Response object representing a goods receipt details")
public class GoodsReceiptResponse {

    @Schema(description = "Unique ID of the goods receipt")
    private UUID id;

    @Schema(description = "Unique receipt code")
    private String receiptCode;

    @Schema(description = "ID of the associated Purchase Order")
    private UUID purchaseOrderId;

    @Schema(description = "Code of the associated Purchase Order")
    private String purchaseOrderCode;

    @Schema(description = "ID of the destination warehouse")
    private UUID warehouseId;

    @Schema(description = "Name of the destination warehouse")
    private String warehouseName;

    @Schema(description = "Status of the receipt")
    private ReceiptStatus status;

    @Schema(description = "Note or description")
    private String note;

    @Schema(description = "Creation date")
    private LocalDateTime createdAt;

    @Schema(description = "Receiving date")
    private LocalDateTime receivedAt;
}
