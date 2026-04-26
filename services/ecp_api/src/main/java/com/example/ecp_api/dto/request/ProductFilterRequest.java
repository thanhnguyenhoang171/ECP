package com.example.ecp_api.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductFilterRequest {
    private String name;
    private String sku;
    private String categoryId;
    private String brand;
    private Boolean isPublished;
}
