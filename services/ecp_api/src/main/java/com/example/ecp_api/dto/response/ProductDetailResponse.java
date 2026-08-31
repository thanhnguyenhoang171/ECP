package com.example.ecp_api.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Composite response containing product details, brand, category, supplier, and SKU variant inventory")
public class ProductDetailResponse {

    @Schema(description = "Main product details")
    private ProductResponse product;

    @Schema(description = "Associated brand information")
    private BrandResponse brand;

    @Schema(description = "Associated category information")
    private CategoryResponse category;

    @Schema(description = "Associated supplier information")
    private SupplierResponse supplier;

    @Schema(description = "List of SKUs with stock quantities")
    private List<SkuDetailItemResponse> skus;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @Schema(description = "SKU variant detail with stock inventory count")
    public static class SkuDetailItemResponse {
        private String id;
        private String skuCode;
        private String variantName;
        private String barcode;
        private String barcodeType;
        private java.math.BigDecimal price;
        private java.math.BigDecimal costPrice;
        private java.math.BigDecimal compareAtPrice;
        private Integer stockQuantity;
        private Boolean active;
        private java.util.Map<String, Object> attributes;
    }
}
