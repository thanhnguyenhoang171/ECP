package com.example.ecp_api.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request object for creating or updating a warehouse")
public class WarehouseRequest {

    @NotBlank(message = "Warehouse code is required")
    @Schema(description = "Unique warehouse code", example = "KHO-HCM-01", requiredMode = Schema.RequiredMode.REQUIRED)
    private String code;

    @NotBlank(message = "Warehouse name is required")
    @Schema(description = "Full name of the warehouse", example = "Kho trung tâm TP.HCM", requiredMode = Schema.RequiredMode.REQUIRED)
    private String name;

    @Schema(description = "Physical address of the warehouse", example = "123 Đường ABC, Quận 1, TP.HCM")
    private String address;

    @Schema(description = "Active status", example = "true")
    private Boolean isActive;
}
