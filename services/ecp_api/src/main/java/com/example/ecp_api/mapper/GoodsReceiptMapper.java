package com.example.ecp_api.mapper;

import com.example.ecp_api.dto.request.GoodsReceiptRequest;
import com.example.ecp_api.dto.response.GoodsReceiptResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.PaginationResponse;
import com.example.ecp_api.entity.jpa.GoodsReceipt;
import org.mapstruct.*;
import org.springframework.data.domain.Page;

import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface GoodsReceiptMapper {

    @Mapping(target = "purchaseOrder", ignore = true)
    @Mapping(target = "warehouse", ignore = true)
    @Mapping(target = "status", constant = "DRAFT")
    GoodsReceipt toEntity(GoodsReceiptRequest request);

    @Mapping(source = "purchaseOrder.id", target = "purchaseOrderId")
    @Mapping(source = "purchaseOrder.poCode", target = "purchaseOrderCode")
    @Mapping(source = "warehouse.id", target = "warehouseId")
    @Mapping(source = "warehouse.name", target = "warehouseName")
    GoodsReceiptResponse toResponse(GoodsReceipt entity);

    List<GoodsReceiptResponse> toResponseList(List<GoodsReceipt> entities);

    @Mapping(target = "purchaseOrder", ignore = true)
    @Mapping(target = "warehouse", ignore = true)
    void updateEntityFromRequest(GoodsReceiptRequest request, @MappingTarget GoodsReceipt entity);

    default PageResponse<GoodsReceiptResponse> toPageResponse(Page<GoodsReceipt> page) {
        PaginationResponse pagination = PaginationResponse.builder()
                .currentPage(page.getNumber() + 1)
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .pageSize(page.getSize())
                .isLast(page.isLast())
                .isFirst(page.isFirst())
                .build();

        return PageResponse.<GoodsReceiptResponse>builder()
                .success(true)
                .code("GOODS_RECEIPT_LIST_FETCHED")
                .message("Fetch data successfully")
                .data(toResponseList(page.getContent()))
                .pagination(pagination)
                .build();
    }
}
