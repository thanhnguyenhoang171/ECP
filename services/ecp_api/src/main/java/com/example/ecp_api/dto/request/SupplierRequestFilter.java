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
@Schema(description = "Filter request for supplier list")
public class SupplierRequestFilter {
    @Schema(description = "General keyword for searching by name, email or tax code", example = "ABC")
    private String keyword;

    @Schema(description = "Filter by active status", example = "true")
    private Boolean active;
}
