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
@Schema(description = "Response object for SKU details")
public class SkuResponse {
    @Schema(description = "Unique SKU ID (UUID)", example = "550e8400-e29b-41d4-a716-446655440000")
    private UUID id;

    @Schema(description = "SKU code", example = "APPLE-IP15-A1B2")
    private String skuCode;

    @Schema(description = "Barcode", example = "8806091111111")
    private String barcode;

    @Schema(description = "Barcode type", example = "EAN-13")
    private String barcodeType;

    @Schema(description = "Associated product ID", example = "65f1a2b3c4d5e6f7a8b9c0d1")
    private String productId;

    @Schema(description = "Associated product name", example = "iPhone 15 Pro Max")
    private String productName;

    @Schema(description = "Variant name", example = "Titanium Grey - 256GB")
    private String variantName;

    @Schema(description = "Active status", example = "true")
    private boolean active;

    @Schema(description = "Creation timestamp")
    private LocalDateTime createdAt;

    @Schema(description = "Last update timestamp")
    private LocalDateTime updatedAt;

    @Schema(description = "Creator username")
    private String createdBy;

    @Schema(description = "Last updater username")
    private String updatedBy;
}
