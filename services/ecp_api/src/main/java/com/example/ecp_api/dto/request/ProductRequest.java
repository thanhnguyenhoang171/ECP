package com.example.ecp_api.dto.request;

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

    private String sku;
    private String name;
    private String slug;
    private String brand;
    private String categoryId;
    private String description;
    private String thumbnail;
    private List<String> images;
    private Map<String, Object> specifications;
    private List<ProductVariantRequest> variants;
    private boolean isPublished;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductVariantRequest {
        private String sku;
        private String barcode;
        private String barcodeType;
        private BigDecimal price;
        private int stock;
        private Map<String, Object> attributes;
        private String image;
        private boolean isActive;
    }
}
