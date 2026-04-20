package com.example.ecp_api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BarcodeScanResponse {

    private String id;
    private String barcode;
    private String productId;
    private String variantSku;
    private String scanType;
    private int quantity;
    private String userId;
    private String sessionId;
    private Map<String, Object> deviceInfo;
    private Map<String, Object> location;
    private LocalDateTime scannedAt;
}
