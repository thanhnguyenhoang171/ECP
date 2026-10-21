package com.example.ecp_api.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record BarcodeLookupResponse(
        SkuAdminResponse sku,
        BigDecimal costPrice,
        BigDecimal price,
        long quantityOnHand,
        long quantityLocked,
        long quantityAvailable,
        List<InventoryResponse> stocks
) {}
