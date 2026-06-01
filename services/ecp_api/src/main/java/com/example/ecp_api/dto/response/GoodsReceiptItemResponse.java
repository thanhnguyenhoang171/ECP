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
@Schema(description = "Response object representing a goods receipt item details")
public class GoodsReceiptItemResponse {

    @Schema(description = "Unique ID of the item line")
    private UUID id;

    @Schema(description = "ID of the parent goods receipt")
    private UUID receiptId;

    @Schema(description = "ID of the SKU")
    private UUID skuId;

    @Schema(description = "SKU Code")
    private String skuCode;

    @Schema(description = "Product Name")
    private String productName;

    @Schema(description = "Batch code")
    private String batchCode;

    @Schema(description = "Manufacture date")
    private LocalDateTime manufactureDate;

    @Schema(description = "Expiry date")
    private LocalDateTime expiryDate;

    @Schema(description = "Quantity received")
    private Integer quantity;

    @Schema(description = "Unit cost")
    private BigDecimal unitCost;

    @Schema(description = "Total cost (quantity * unitCost)")
    private BigDecimal totalCost;
}
