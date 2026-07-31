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
@Schema(description = "Request object for creating or updating a brand")
public class BrandRequest {

    @NotBlank(message = "Brand name is required")
    @Schema(description = "Name of the brand", example = "Apple", requiredMode = Schema.RequiredMode.REQUIRED)
    private String name;

    @Schema(description = "URL-friendly slug. Auto-generated if empty.", example = "apple")
    private String slug;

    @Schema(description = "Brand logo URL", example = "https://example.com/logo.png")
    private String logo;

    @Schema(description = "Detailed brand description", example = "Apple Inc. is an American multinational technology company...")
    private String description;

    @Schema(description = "Official website URL", example = "https://www.apple.com")
    private String website;

    @Schema(description = "Active status", example = "true")
    private Boolean active;
}
