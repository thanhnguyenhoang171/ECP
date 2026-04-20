package com.example.ecp_api.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BarcodeScanRequest {

    private String barcode;
    private String productId;
    private String variantSku;
    private String scanType; // view | add_to_cart | purchase | inventory
    private int quantity;
    private String userId;
    private String sessionId;
    private Map<String, Object> deviceInfo;
    private Map<String, Object> location;
}
