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
@Schema(description = "Request object for creating or updating a category")
public class CategoryRequest {
    @NotBlank(message = "Category name is required")
    @Schema(description = "Category name", example = "Electronics", requiredMode = Schema.RequiredMode.REQUIRED)
    private String name;

    @Schema(description = "Category description", example = "Electronics items including gadgets and devices")
    private String description;

    @Schema(description = "URL-friendly slug. Auto-generated from name if empty.", example = "electronics")
    private String slug;

    @Schema(description = "ID of the parent category. Leave empty for top-level.", example = "65f1a2b3c4d5e6f7a8b9c0d1")
    private String parentId;

    @Schema(description = "Active status of the category", example = "true")
    private Boolean active;

    @Schema(description = "Category image URL", example = "https://res.cloudinary.com/...")
    private String imageUrl;

    @Schema(description = "Category image public ID", example = "ecp_uploads/categories/abcxyz")
    private String imagePublicId;

    @Schema(description = "Order position for sorting", example = "1")
    private Integer order;
}
