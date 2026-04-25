package com.example.ecp_api.dto.request;

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
public class ProductRequest {

    @NotBlank(message = "SKU is required")
    private String sku;

    @NotBlank(message = "Product name is required")
    private String name;

    @NotBlank(message = "Slug is required")
    private String slug;

    private String brand;
    private String categoryId;
    private String description;
    private String thumbnail;
    private List<String> images;
    private Map<String, Object> specifications;

    @NotEmpty(message = "Product must have at least one variant")
    private List<ProductVariantRequest> variants;
    
    private Boolean isPublished;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductVariantRequest {
        @NotBlank(message = "Variant SKU is required")
        private String sku;
        private String barcode;
        private String barcodeType;

        @NotNull(message = "Price is required")
        private BigDecimal price;

        private int stock;
        private Map<String, Object> attributes;
        private String image;
        private Boolean isActive;
    }
}
