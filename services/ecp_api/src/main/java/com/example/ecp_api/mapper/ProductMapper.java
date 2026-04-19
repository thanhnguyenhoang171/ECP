package com.example.ecp_api.mapper;

import com.example.ecp_api.dto.request.ProductRequest;
import com.example.ecp_api.dto.response.ProductResponse;
import com.example.ecp_api.entity.jpa.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    // Convert Request -> Entity (CREATE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    Product toEntity(ProductRequest productRequest);

    // Convert Entity -> Response (READ)
    @Mapping(target = "imageUrl", source = "image.url")
    @Mapping(target = "category", source = "category.name")
    ProductResponse toResponse(Product product);

    // Update Entity from Request (UPDATE)
    void updateProductFromRequest(ProductRequest request, @MappingTarget Product product);
}