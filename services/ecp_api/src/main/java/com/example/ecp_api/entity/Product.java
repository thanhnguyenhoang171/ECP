package com.example.ecp_api.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.*;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Document(collection = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    private String id;

    @Indexed(unique = true)
    private String sku; // IPHONE-15-PRO

    private String name;

    @Indexed(unique = true)
    private String slug; // iphone-15-pro for SEO

    private String brand;

    @Indexed
    private String categoryId;  // storage ID string not use @DBRef

    private String description;

    private String thumbnail;

    @Builder.Default
    private List<String> images = new ArrayList<>();

    // Tổng tồn kho (Cộng dồn từ các biến thể bên dưới)
    @Builder.Default
    private int totalStock = 0;

    // ==========================================
    // THE MAGIC OF NOSQL: DỮ LIỆU ĐỘNG
    // ==========================================

    // {"Screen": "6.7 inch OLED", "Chip": "A17 Pro"}
    @Builder.Default
    private Map<String, String> specifications = new HashMap<>();

    // EMBEDDED ARRAY
    @Builder.Default
    private List<Variant> variants = new ArrayList<>();

    @Builder.Default
    private boolean isPublished = false; // allow show in web?

    @Builder.Default
    private boolean isDeleted = false; // Soft Delete

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @CreatedBy
    private String createdBy;

    @LastModifiedBy
    private String updatedBy;

    private String deletedBy;


    // INNER CLASS: define structure of a variant
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Variant {

        // Specific SKU of this version (IP15-PRO-256-TITAN)
        @Indexed(unique = true)
        private String sku;

        private BigDecimal price; // Use BigDecimal to prevent mathematical error

        @Builder.Default
        private int stock = 0;

        // Specific attribute {"Color": "Titan Tự nhiên", "Storage": "256GB"}
        @Builder.Default
        private Map<String, String> attributes = new HashMap<>();

        private String image; // image for version
    }
}