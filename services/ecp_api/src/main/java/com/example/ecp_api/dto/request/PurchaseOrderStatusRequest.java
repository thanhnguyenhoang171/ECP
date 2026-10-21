package com.example.ecp_api.dto.request;

public record PurchaseOrderStatusRequest(
        @jakarta.validation.constraints.NotNull com.example.ecp_api.enums.common.PurchaseOrderStatus status) {}
