package com.example.ecp_api.mapper;

import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.PaginationResponse;
import com.example.ecp_api.dto.response.SkuResponse;
import com.example.ecp_api.entity.jpa.Sku;
import org.mapstruct.Mapper;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface SkuMapper {

    SkuResponse toResponse(Sku sku);

    default PageResponse<SkuResponse> toPageResponse(Page<Sku> page) {
        List<SkuResponse> list = page.getContent().stream()
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

        return PageResponse.<SkuResponse>builder()
                .success(true)
                .message("Fetch SKU list successfully")
                .data(list)
                .pagination(pagination)
                .build();
    }
}
