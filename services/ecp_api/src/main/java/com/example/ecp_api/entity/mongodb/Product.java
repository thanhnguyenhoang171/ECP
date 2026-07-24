package com.example.ecp_api.entity.mongodb;

import com.example.ecp_api.entity.mongodb.embedded.ProductImage;
import com.example.ecp_api.entity.mongodb.embedded.ProductVariant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.*;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

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
    private String id; // MongoDB ObjectId

    @Indexed(unique = true)
    private String sku;

    @Field("name")
    private String name;

    @Indexed(unique = true)
    private String slug;

    private String brand;

    @Indexed
    @Field("category_id")
    private String categoryId;

    private String description;

    private ProductImage thumbnail;

    @Builder.Default
    private List<ProductImage> images = new ArrayList<>();

    @Builder.Default
    private Map<String, Object> specifications = new HashMap<>();

    @Field("product_variants")
    @Builder.Default
    private List<ProductVariant> variants = new ArrayList<>();

    @Field("is_published")
    @Builder.Default
    private boolean published = false;

    @Field("is_deleted")
    @Builder.Default
    private boolean deleted = false;

    @Field("is_featured")
    @Builder.Default
    private boolean isFeatured = false;

    @Field("is_new")
    @Builder.Default
    private boolean isNew = false;

    @Field("is_best_seller")
    @Builder.Default
    private boolean isBestSeller = false;

    @Field("view_count")
    @Builder.Default
    private int viewCount = 0;

    @Field("sold_count")
    @Builder.Default
    private int soldCount = 0;

    @Field("rating_avg")
    @Builder.Default
    private BigDecimal ratingAvg = BigDecimal.ZERO;

    @Field("rating_count")
    @Builder.Default
    private int ratingCount = 0;

    @CreatedDate
    @Field("created_at")
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Field("updated_at")
    private LocalDateTime updatedAt;

    @CreatedBy
    @Field("created_by")
    private String createdBy;

    @LastModifiedBy
    @Field("updated_by")
    private String updatedBy;
}
