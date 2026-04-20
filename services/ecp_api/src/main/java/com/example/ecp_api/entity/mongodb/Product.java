package com.example.ecp_api.entity.mongodb;

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

    private String thumbnail;

    @Builder.Default
    private List<String> images = new ArrayList<>();

    @Field("total_stock")
    @Builder.Default
    private int totalStock = 0;

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

    @CreatedDate
    @Field("created_at")
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Field("updated_at")
    private LocalDateTime updatedAt;
}
