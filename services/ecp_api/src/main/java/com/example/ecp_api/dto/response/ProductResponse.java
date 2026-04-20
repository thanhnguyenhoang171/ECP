package com.example.ecp_api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {

    private String id;
    private String sku;
    private String name;
    private String slug;
    private String brand;
    private String categoryId;
    private String description;
    private String thumbnail;
    private List<String> images;
    private int totalStock;
    private Map<String, Object> specifications;
    private List<ProductVariantResponse> variants;
    private boolean isPublished;
    private boolean isDeleted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductVariantResponse {
        private String id;
        private String sku;
        private String barcode;
        private String barcodeType;
        private BigDecimal price;
        private int stock;
        private Map<String, Object> attributes;
        private String image;
        private boolean isActive;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
