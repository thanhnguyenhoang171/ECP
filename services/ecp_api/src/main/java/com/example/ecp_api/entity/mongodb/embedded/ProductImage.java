package com.example.ecp_api.entity.mongodb.embedded;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import io.swagger.v3.oas.annotations.media.Schema;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductImage {
    @Schema(description = "Image URL", example = "https://res.cloudinary.com/demo/image/upload/sample.jpg")
    private String url;
    
    @Schema(description = "Cloudinary Public ID", example = "sample")
    private String publicId;
}
