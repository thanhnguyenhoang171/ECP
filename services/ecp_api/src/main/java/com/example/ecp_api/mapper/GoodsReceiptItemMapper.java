package com.example.ecp_api.mapper;

import com.example.ecp_api.dto.response.GoodsReceiptItemResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.PaginationResponse;
import com.example.ecp_api.entity.jpa.GoodsReceiptItem;
import org.mapstruct.*;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;
import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface GoodsReceiptItemMapper {

    @Mapping(source = "goodsReceipt.id", target = "receiptId")
    @Mapping(source = "sku.id", target = "skuId")
    @Mapping(source = "sku.skuCode", target = "skuCode")
    @Mapping(source = "sku.productName", target = "productName")
    @Mapping(target = "totalCost", expression = "java(calculateTotalCost(entity))")
    GoodsReceiptItemResponse toResponse(GoodsReceiptItem entity);

    List<GoodsReceiptItemResponse> toResponseList(List<GoodsReceiptItem> entities);

    default BigDecimal calculateTotalCost(GoodsReceiptItem entity) {
        if (entity == null || entity.getUnitCost() == null || entity.getQuantity() == null) {
            return BigDecimal.ZERO;
        }
        return entity.getUnitCost().multiply(new BigDecimal(entity.getQuantity()));
    }

    default PageResponse<GoodsReceiptItemResponse> toPageResponse(Page<GoodsReceiptItem> page) {
        PaginationResponse pagination = PaginationResponse.builder()
                .currentPage(page.getNumber() + 1)
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .pageSize(page.getSize())
                .isLast(page.isLast())
                .isFirst(page.isFirst())
                .build();

        return PageResponse.<GoodsReceiptItemResponse>builder()
                .success(true)
                .code("GOODS_RECEIPT_ITEM_LIST_FETCHED")
                .message("Fetch data successfully")
                .data(toResponseList(page.getContent()))
                .pagination(pagination)
                .build();
    }
}
