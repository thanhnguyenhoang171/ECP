package com.example.ecp_api.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response object representing a warehouse")
public class WarehouseResponse {

    @Schema(description = "Unique warehouse ID (UUID)", example = "550e8400-e29b-41d4-a716-446655440000")
    private UUID id;

    @Schema(description = "Unique warehouse code", example = "KHO-HCM-01")
    private String code;

    @Schema(description = "Warehouse name", example = "Kho trung tâm TP.HCM")
    private String name;

    @Schema(description = "Physical address", example = "123 Đường ABC, Quận 1, TP.HCM")
    private String address;

    @Schema(description = "Active status", example = "true")
    private boolean isActive;

    @Schema(description = "Creation timestamp")
    private LocalDateTime createdAt;

    @Schema(description = "Last update timestamp")
    private LocalDateTime updatedAt;

    @Schema(description = "Creator username")
    private String createdBy;

    @Schema(description = "Last updater username")
    private String updatedBy;
}
