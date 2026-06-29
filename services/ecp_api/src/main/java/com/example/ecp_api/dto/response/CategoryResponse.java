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
@Schema(description = "Response object representing a category")
public class CategoryResponse {
    @Schema(description = "Unique category ID", example = "65f1a2b3c4d5e6f7a8b9c0d1")
    private String id;

    @Schema(description = "Category name", example = "Electronics")
    private String name;

    @Schema(description = "Category description", example = "Electronics items including gadgets and devices")
    private String description;

    @Schema(description = "URL-friendly slug", example = "electronics")
    private String slug;

    @Schema(description = "ID of the parent category", example = "65f1a2b3c4d5e6f7a8b9c0d1")
    private String parentId;

    @Schema(description = "Nesting level (1 for top-level)", example = "1")
    private int level;

    @Schema(description = "Active status", example = "true")
    private Boolean active;

    @Schema(description = "Creation timestamp")
    private LocalDateTime createdAt;

    @Schema(description = "Last update timestamp")
    private LocalDateTime updatedAt;

    @Schema(description = "Category image URL", example = "https://res.cloudinary.com/...")
    private String imageUrl;

    @Schema(description = "Category image public ID", example = "ecp_uploads/categories/abcxyz")
    private String imagePublicId;

    @Schema(description = "Order position for sorting", example = "1")
    private Integer order;
}
