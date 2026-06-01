package com.example.ecp_api.dto.response;

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
public class InventoryResponse {
    private UUID id;
    private UUID warehouseId;
    private String warehouseName;
    private UUID skuId;
    private String skuCode;
    private String productName;
    private String batchCode;
    private LocalDateTime manufactureDate;
    private LocalDateTime expiryDate;
    private Integer quantityOnHand;
    private Integer quantityLocked;
    private LocalDateTime updatedAt;
}
