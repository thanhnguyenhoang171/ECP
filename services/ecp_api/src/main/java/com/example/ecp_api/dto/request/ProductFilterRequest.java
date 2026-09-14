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
@Schema(description = "Filter parameters for product catalog")
public class ProductFilterRequest {
    @Schema(description = "Product ID", example = "65f1a2b3c4d5e6f7a8b9c0d1")
    private String id;

    @Schema(description = "Product name (case-insensitive partial search)", example = "iPhone")
    private String name;

    @Schema(description = "SKU code", example = "APPLE-IP15-128")
    private String sku;

    @Schema(description = "Category ID", example = "cat-dien-thoai")
    private String categoryId;

    @Schema(description = "Brand name", example = "Apple")
    private String brand;

    @Schema(description = "Brand ID", example = "brand-apple")
    private String brandId;

    @Schema(description = "Filter by published status", example = "true")
    private Boolean isPublished;

    @Schema(description = "Filter by featured status", example = "true")
    private Boolean isFeatured;

    @Schema(description = "Filter by new product status", example = "true")
    private Boolean isNew;

    @Schema(description = "Filter by best seller status", example = "true")
    private Boolean isBestSeller;
}
