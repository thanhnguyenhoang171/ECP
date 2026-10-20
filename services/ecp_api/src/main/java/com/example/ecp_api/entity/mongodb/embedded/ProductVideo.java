package com.example.ecp_api.entity.mongodb.embedded;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductVideo {
    @NotBlank(message = "Video URL is required")
    @Pattern(regexp = "^https?://.+", message = "Video URL must use HTTP or HTTPS")
    private String url;
    private String publicId;
}
