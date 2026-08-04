package com.example.ecp_api.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response object representing a brand")
public class BrandResponse {

    @Schema(description = "Unique Brand ID", example = "65f1a2b3c4d5e6f7a8b9c0d1")
    private String id;

    @Schema(description = "Brand name", example = "Apple")
    private String name;

    @Schema(description = "URL-friendly slug", example = "apple")
    private String slug;

    @Schema(description = "Brand logo URL", example = "https://example.com/logo.png")
    private String logo;

    @Schema(description = "Brand description")
    private String description;

    @Schema(description = "Brand official website")
    private String website;

    @Schema(description = "Active status")
    private boolean active;

    @Schema(description = "Creation timestamp")
    private LocalDateTime createdAt;

    @Schema(description = "Last update timestamp")
    private LocalDateTime updatedAt;

}
