package com.example.ecp_api.entity.mongodb;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Document(collection = "barcode_scans")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BarcodeScan {

    @Id
    private String id; // MongoDB ObjectId

    @Field("barcode")
    private String barcode;

    @Field("product_id")
    private String productId;

    @Field("variant_sku")
    private String variantSku;

    @Field("scan_type")
    private String scanType; // view | add_to_cart | purchase | inventory

    @Builder.Default
    private int quantity = 1;

    // user tracking
    @Field("user_id")
    private String userId;

    @Field("session_id")
    private String sessionId;

    // device info: { ip, device, os, browser }
    @Field("device_info")
    @Builder.Default
    private Map<String, Object> deviceInfo = new HashMap<>();

    // location: { lat, lng }
    @Field("location")
    @Builder.Default
    private Map<String, Object> location = new HashMap<>();

    @CreatedDate
    @Field("scanned_at")
    private LocalDateTime scannedAt;
}
