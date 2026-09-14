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
@Schema(description = "Filter parameters for category list")
public class CategoryFilterRequest {
    @Schema(description = "Category ID", example = "65f1a2b3c4d5e6f7a8b9c0d2")
    private String id;

    @Schema(description = "Search keyword in category name or slug", example = "Điện thoại")
    private String keyword;

    @Schema(description = "Category name", example = "Điện thoại")
    private String name;

    @Schema(description = "Category slug", example = "dien-thoai")
    private String slug;

    @Schema(description = "Parent category ID", example = "root")
    private String parentId;

    @Schema(description = "Hierarchy level (1: root, 2: sub-category)", example = "1")
    private Integer level;

    @Schema(description = "Active status filter", example = "true")
    private Boolean active;

    @Schema(description = "Featured category filter", example = "true")
    private Boolean isFeatured;
}
