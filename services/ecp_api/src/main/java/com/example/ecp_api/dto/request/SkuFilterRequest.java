package com.example.ecp_api.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Filter request for SKU list")
public class SkuFilterRequest {
    @Schema(description = "Filter by SKU code (exact match)", example = "APPLE-IP15-A1B2")
    private String skuCode;

    @Schema(description = "Filter by product ID", example = "65f1a2b3c4d5e6f7a8b9c0d1")
    private String productId;

    @Schema(description = "Filter by product name (partial match)", example = "iPhone")
    private String productName;

    @Schema(description = "Filter by active status", example = "true")
    private Boolean active;
}
