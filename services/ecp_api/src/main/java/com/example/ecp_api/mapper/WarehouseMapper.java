package com.example.ecp_api.mapper;

import com.example.ecp_api.dto.request.WarehouseRequest;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.PaginationResponse;
import com.example.ecp_api.dto.response.WarehouseAdminResponse;
import com.example.ecp_api.dto.response.WarehouseResponse;
import com.example.ecp_api.entity.jpa.Warehouse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface WarehouseMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "active", source = "isActive")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    Warehouse toEntity(WarehouseRequest request);

    @Mapping(target = "isActive", source = "active")
    WarehouseResponse toResponse(Warehouse warehouse);

    @Mapping(target = "isActive", source = "active")
    WarehouseAdminResponse toAdminResponse(Warehouse warehouse);

    List<WarehouseResponse> toResponseList(List<Warehouse> warehouses);

    List<WarehouseAdminResponse> toAdminResponseList(List<Warehouse> warehouses);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "active", source = "isActive")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    void updateWarehouseFromRequest(WarehouseRequest request, @MappingTarget Warehouse warehouse);

    default PageResponse<WarehouseResponse> toPageResponse(Page<Warehouse> page) {
        List<WarehouseResponse> list = page.getContent().stream()
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

        return PageResponse.<WarehouseResponse>builder()
                .success(true)
                .message("Fetch data successfully")
                .data(list)
                .pagination(pagination)
                .build();
    }

    default PageResponse<WarehouseAdminResponse> toAdminPageResponse(Page<Warehouse> page) {
        List<WarehouseAdminResponse> list = page.getContent().stream()
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

        return PageResponse.<WarehouseAdminResponse>builder()
                .success(true)
                .message("Fetch admin data successfully")
                .data(list)
                .pagination(pagination)
                .build();
    }
}
