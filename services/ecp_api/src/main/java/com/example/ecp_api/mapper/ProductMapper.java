package com.example.ecp_api.mapper;

import com.example.ecp_api.dto.request.ProductRequest;
import com.example.ecp_api.dto.response.ProductResponse;
import com.example.ecp_api.entity.mongodb.Product;
import com.example.ecp_api.entity.mongodb.embedded.ProductVariant;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    // --- Product Mappings ---

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "totalStock", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "published", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Product toEntity(ProductRequest request);

    ProductResponse toResponse(Product product);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "totalStock", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "published", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateProductFromRequest(ProductRequest request, @MappingTarget Product product);

    // --- Product Variant Mappings ---

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "productId", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    ProductVariant toVariantEntity(ProductRequest.ProductVariantRequest request);

    ProductResponse.ProductVariantResponse toVariantResponse(ProductVariant variant);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "productId", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateVariantFromRequest(ProductRequest.ProductVariantRequest request, @MappingTarget ProductVariant variant);
}
