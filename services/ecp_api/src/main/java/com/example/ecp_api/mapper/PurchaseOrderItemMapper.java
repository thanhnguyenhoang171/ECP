package com.example.ecp_api.mapper;

import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.PaginationResponse;
import com.example.ecp_api.dto.response.PurchaseOrderItemAdminResponse;
import com.example.ecp_api.dto.response.PurchaseOrderItemResponse;
import com.example.ecp_api.entity.jpa.PurchaseOrderItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface PurchaseOrderItemMapper {


    @Mapping(target = "purchaseOrderId", source = "purchaseOrder.id")
    @Mapping(target = "purchaseOrderCode", source = "purchaseOrder.poCode")
    @Mapping(target = "skuId", source = "sku.id")
    @Mapping(target = "skuCode", source = "sku.skuCode")
    @Mapping(target = "productName", source = "sku.productName")
    @Mapping(target = "variantName", source = "sku.variantName")
    PurchaseOrderItemResponse toResponse(PurchaseOrderItem purchaseOrderItem);

    List<PurchaseOrderItemResponse> toResponseList(List<PurchaseOrderItem> purchaseOrderItems);

    @Mapping(target = "purchaseOrderId", source = "purchaseOrder.id")
    @Mapping(target = "purchaseOrderCode", source = "purchaseOrder.poCode")
    @Mapping(target = "skuId", source = "sku.id")
    @Mapping(target = "skuCode", source = "sku.skuCode")
    @Mapping(target = "productName", source = "sku.productName")
    @Mapping(target = "variantName", source = "sku.variantName")
    PurchaseOrderItemAdminResponse toAdminResponse(PurchaseOrderItem purchaseOrderItem);


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

    default PageResponse<PurchaseOrderItemAdminResponse> toAdminPageResponse(Page<PurchaseOrderItem> page) {
        List<PurchaseOrderItemAdminResponse> list = page.getContent().stream()
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

        return PageResponse.<PurchaseOrderItemAdminResponse>builder()
                .success(true)
                .code("PURCHASE_ORDER_ITEM_LIST_FETCHED")
                .message("Fetch data successfully")
                .data(list)
                .pagination(pagination)
                .build();
    }
}
