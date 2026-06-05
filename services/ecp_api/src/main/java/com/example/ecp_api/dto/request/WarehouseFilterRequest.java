package com.example.ecp_api.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Filter request for warehouse list")
public class WarehouseFilterRequest {
    @Schema(description = "Filter by exact warehouse ID", example = "550e8400-e29b-41d4-a716-446655440000")
    private String id;

    @Schema(description = "General search keyword for name, code or address", example = "HCM")
    private String keyword;

    @Schema(description = "Filter by exact warehouse code", example = "KHO-HCM-01")
    private String code;

    @Schema(description = "Filter by warehouse name (partial match)", example = "Kho trung tâm")
    private String name;

    @Schema(description = "Filter by active status", example = "true")
    private Boolean active;
}
