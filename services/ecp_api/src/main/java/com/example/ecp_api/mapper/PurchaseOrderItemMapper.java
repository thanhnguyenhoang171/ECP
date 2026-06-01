package com.example.ecp_api.mapper;

import com.example.ecp_api.dto.request.PurchaseOrderItemRequest;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.PaginationResponse;
import com.example.ecp_api.dto.response.PurchaseOrderItemResponse;
import com.example.ecp_api.entity.jpa.PurchaseOrderItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface PurchaseOrderItemMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "purchaseOrder", ignore = true)
    @Mapping(target = "sku", ignore = true)
    PurchaseOrderItem toEntity(PurchaseOrderItemRequest request);

    @Mapping(target = "purchaseOrderId", source = "purchaseOrder.id")
    @Mapping(target = "purchaseOrderCode", source = "purchaseOrder.poCode")
    @Mapping(target = "skuId", source = "sku.id")
    @Mapping(target = "skuCode", source = "sku.skuCode")
    @Mapping(target = "productName", source = "sku.productName")
    @Mapping(target = "variantName", source = "sku.variantName")
    PurchaseOrderItemResponse toResponse(PurchaseOrderItem purchaseOrderItem);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "purchaseOrder", ignore = true)
    @Mapping(target = "sku", ignore = true)
    void updatePurchaseOrderItemFromRequest(PurchaseOrderItemRequest request, @MappingTarget PurchaseOrderItem purchaseOrderItem);

    default PageResponse<PurchaseOrderItemResponse> toPageResponse(Page<PurchaseOrderItem> page) {
        List<PurchaseOrderItemResponse> list = page.getContent().stream()
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

        return PageResponse.<PurchaseOrderItemResponse>builder()
                .success(true)
                .code("PURCHASE_ORDER_ITEM_LIST_FETCHED")
                .message("Fetch data successfully")
                .data(list)
                .pagination(pagination)
                .build();
    }
}
