package com.example.ecp_api.mapper;

import com.example.ecp_api.dto.request.SupplierRequest;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.PaginationResponse;
import com.example.ecp_api.dto.response.SupplierAdminResponse;
import com.example.ecp_api.dto.response.SupplierResponse;
import com.example.ecp_api.entity.jpa.Supplier;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface SupplierMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "active", source = "isActive")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    Supplier toEntity(SupplierRequest request);

    @Mapping(target = "isActive", source = "active")
    SupplierResponse toResponse(Supplier supplier);

    @Mapping(target = "isActive", source = "active")
    SupplierAdminResponse toAdminResponse(Supplier supplier);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "active", source = "isActive")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    void updateSupplierFromRequest(SupplierRequest request, @MappingTarget Supplier supplier);

    default PageResponse<SupplierResponse> toPageResponse(Page<Supplier> page) {
        List<SupplierResponse> list = page.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        PaginationResponse pagination = PaginationResponse.builder()
                .currentPage(page.getNumber() + 1)
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .pageSize(page.getSize())
                .isLast(page.isLast())
                .isFirst(page.isFirst())
                .build();

        return PageResponse.<SupplierResponse>builder()
                .success(true)
                .message("Fetch data successfully")
                .data(list)
                .pagination(pagination)
                .build();
    }

    default PageResponse<SupplierAdminResponse> toAdminPageResponse(Page<Supplier> page) {
        List<SupplierAdminResponse> list = page.getContent().stream()
                .map(this::toAdminResponse)
                .collect(Collectors.toList());

        PaginationResponse pagination = PaginationResponse.builder()
                .currentPage(page.getNumber() + 1)
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .pageSize(page.getSize())
                .isLast(page.isLast())
                .isFirst(page.isFirst())
                .build();

        return PageResponse.<SupplierAdminResponse>builder()
                .success(true)
                .message("Fetch data successfully")
                .data(list)
                .pagination(pagination)
                .build();
    }
}
