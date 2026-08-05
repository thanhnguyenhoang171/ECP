package com.example.ecp_api.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.example.ecp_api.entity.mongodb.embedded.ProductImage;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response object representing a product with all its information")
public class ProductResponse {

    @Schema(description = "Unique MongoDB ID", example = "65f1a2b3c4d5e6f7a8b9c0d1")
    private String id;

    @Schema(description = "Product SKU", example = "APPLE-IP15-A1B2")
    private String sku;

    @Schema(description = "Full name of the product", example = "iPhone 15 Pro Max")
    private String name;

    @Schema(description = "URL-friendly slug", example = "iphone-15-pro-max")
    private String slug;

    @Schema(description = "Brand name", example = "Apple")
    private String brand;

    @Schema(description = "ID of the brand", example = "65f1a2b3c4d5e6f7a8b9c0d1")
    private String brandId;

    @Schema(description = "ID of the category", example = "65f1a2b3c4d5e6f7a8b9c0d1")
    private String categoryId;

    @Schema(description = "Detailed product description")
    private String description;

    @Schema(description = "Main product image")
    private ProductImage thumbnail;

    @Schema(description = "List of product gallery images")
    private List<ProductImage> images;

    @Schema(description = "Dynamic specifications")
    private Map<String, Object> specifications;

    @Schema(description = "List of product variants")
    private List<ProductVariantResponse> variants;

    @Schema(description = "Visibility status")
    private boolean isPublished;

    @Schema(description = "Featured product status")
    private boolean isFeatured;

    @Schema(description = "New product status")
    private boolean isNew;

    @Schema(description = "Best seller product status")
    private boolean isBestSeller;

    @Schema(description = "Total view count")
    private int viewCount;

    @Schema(description = "Total sold count")
    private int soldCount;

    @Schema(description = "Average rating")
    private BigDecimal ratingAvg;

    @Schema(description = "Total rating count")
    private int ratingCount;

    @Schema(description = "Creation timestamp")
    private LocalDateTime createdAt;

    @Schema(description = "Last update timestamp")
    private LocalDateTime updatedAt;

    @Schema(description = "Email of the user who created the product")
    private String createdBy;

    @Schema(description = "Email of the user who last updated the product")
    private String updatedBy;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @Schema(description = "Response object for a product variant")
    public static class ProductVariantResponse {
        @Schema(description = "Variant SKU", example = "APPLE-IP15-TIT-256-X1Y")
        private String sku;

        @Schema(description = "Reference to the MySQL Sku ID", example = "550e8400-e29b-41d4-a716-446655440000")
        private String skuId;

        @Schema(description = "Barcode of the variant")
        private String barcode;

        @Schema(description = "Type of barcode")
        private String barcodeType;

        @Schema(description = "Price of this variant")
        private BigDecimal price;

        @Schema(description = "Cost price of this variant")
        private BigDecimal costPrice;

        @Schema(description = "Compare at price (original price before discount)")
        private BigDecimal compareAtPrice;

        @Schema(description = "Variant specific image")
        private ProductImage image;

        @Schema(description = "Variant specific attributes")
        private Map<String, Object> attributes;

        @Schema(description = "Active status")
        private boolean isActive;

        @Schema(description = "Creation timestamp")
        private LocalDateTime createdAt;

        @Schema(description = "Last update timestamp")
        private LocalDateTime updatedAt;
    }
}
