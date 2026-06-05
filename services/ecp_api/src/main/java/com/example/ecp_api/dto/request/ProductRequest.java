package com.example.ecp_api.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request object for creating a product")
public class ProductRequest {

    @Schema(description = "Product SKU. Auto-generated if empty.", example = "APPLE-IP15-A1B2")
    private String sku;

    @NotBlank(message = "Product name is required")
    @Schema(description = "Full name of the product", example = "iPhone 15 Pro Max", requiredMode = Schema.RequiredMode.REQUIRED)
    private String name;

    @Schema(description = "URL-friendly slug. Auto-generated from name if empty.", example = "iphone-15-pro-max")
    private String slug;

    @Schema(description = "Brand name", example = "Apple")
    private String brand;

    @Schema(description = "ID of the category this product belongs to", example = "65f1a2b3c4d5e6f7a8b9c0d1")
    private String categoryId;

    @Schema(description = "Detailed product description", example = "The latest iPhone with Titan frame...")
    private String description;

    @Schema(description = "Main product image URL", example = "https://example.com/thumb.jpg")
    private String thumbnail;

    @Schema(description = "List of product gallery image URLs")
    private List<String> images;

    @Schema(description = "Dynamic specifications (Map of Key-Value pairs)", example = "{\"RAM\": \"12GB\", \"Chip\": \"A17 Pro\"}")
    private Map<String, Object> specifications;

    @NotEmpty(message = "Product must have at least one variant")
    @Schema(description = "List of product variants (different colors, sizes, etc.)", requiredMode = Schema.RequiredMode.REQUIRED)
    private List<ProductVariantRequest> variants;
    
    @Schema(description = "Visibility status of the product", example = "true")
    private Boolean isPublished;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @Schema(description = "Request object for a product variant")
    public static class ProductVariantRequest {
        @Schema(description = "Variant SKU. Auto-generated from parent SKU and attributes if empty.", example = "APPLE-IP15-TIT-256-X1Y")
        private String sku;

        @Schema(description = "Barcode of the variant", example = "8806091111111")
        private String barcode;

        @Schema(description = "Type of barcode (EAN-13, UPC, etc.)", example = "EAN-13")
        private String barcodeType;

        @NotNull(message = "Price is required")
        @Schema(description = "Price of this variant", example = "32990000", requiredMode = Schema.RequiredMode.REQUIRED)
        private BigDecimal price;

        @Schema(description = "Variant specific attributes (Color, Size, etc.)", example = "{\"Color\": \"Titanium Grey\", \"Storage\": \"256GB\"}")
        private Map<String, Object> attributes;

        @Schema(description = "Variant specific image URL", example = "https://example.com/variant-grey.jpg")
        private String image;

        @Schema(description = "Active status of this variant", example = "true")
        private Boolean isActive;
    }
}
