package com.example.ecp_api.entity.mongodb.embedded;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Field;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariant {

    @Id
    private String id; // Implicit ID for the embedded document

    @Field("product_id")
    private String productId;

    @Indexed(unique = true)
    private String sku;

    @Indexed(unique = true)
    private String barcode;

    @Field("barcode_type")
    @Builder.Default
    private String barcodeType = "EAN-13";

    private BigDecimal price;

    @Builder.Default
    private int stock = 0;

    // Attributes: { "Color": "Titan", "Storage": "256GB" }
    @Builder.Default
    private Map<String, Object> attributes = new HashMap<>();

    private String image;

    @Field("is_active")
    @Builder.Default
    private boolean active = true;

    @CreatedDate
    @Field("created_at")
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Field("updated_at")
    private LocalDateTime updatedAt;
}
