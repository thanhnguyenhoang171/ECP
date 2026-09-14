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
@Schema(description = "Filter parameters for brand list")
public class BrandFilterRequest {
    @Schema(description = "Brand ID", example = "65f1a2b3c4d5e6f7a8b9c0d3")
    private String id;

    @Schema(description = "Brand name (partial match search)", example = "Apple")
    private String name;

    @Schema(description = "Brand slug", example = "apple")
    private String slug;

    @Schema(description = "Active status filter", example = "true")
    private Boolean active;
}
