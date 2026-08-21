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
@Schema(description = "Media file detail response for Admin management")
public class AdminFileResponse {

    @Schema(description = "Entity ID", example = "550e8400-e29b-41d4-a716-446655440000")
    private String refId;

    @Schema(description = "File type", example = "USER_AVATAR")
    private String type; // USER_AVATAR, PRODUCT_THUMBNAIL, PRODUCT_GALLERY, CATEGORY_IMAGE

    @Schema(description = "Full image URL")
    private String url;

    @Schema(description = "Cloudinary public ID")
    private String publicId;

    @Schema(description = "Owner/Entity name", example = "John Doe")
    private String refName;

    @Schema(description = "Created or updated by email")
    private String ownerEmail;

    @Schema(description = "Last updated time")
    private LocalDateTime updatedAt;
}
