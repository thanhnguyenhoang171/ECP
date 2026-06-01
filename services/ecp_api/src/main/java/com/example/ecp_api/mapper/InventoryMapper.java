package com.example.ecp_api.mapper;

import com.example.ecp_api.dto.response.InventoryLedgerResponse;
import com.example.ecp_api.dto.response.InventoryResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.PaginationResponse;
import com.example.ecp_api.entity.jpa.Inventory;
import com.example.ecp_api.entity.jpa.InventoryLedger;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;
import org.springframework.data.domain.Page;

import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface InventoryMapper {

    @Mapping(source = "warehouse.id", target = "warehouseId")
    @Mapping(source = "warehouse.name", target = "warehouseName")
    @Mapping(source = "sku.id", target = "skuId")
    @Mapping(source = "sku.skuCode", target = "skuCode")
    @Mapping(source = "sku.productName", target = "productName")
    InventoryResponse toResponse(Inventory entity);

    List<InventoryResponse> toResponseList(List<Inventory> entities);

    @Mapping(source = "warehouse.name", target = "warehouseName")
    @Mapping(source = "sku.skuCode", target = "skuCode")
    InventoryLedgerResponse toLedgerResponse(InventoryLedger entity);

    List<InventoryLedgerResponse> toLedgerResponseList(List<InventoryLedger> entities);

    default PageResponse<InventoryResponse> toPageResponse(Page<Inventory> page) {
        PaginationResponse pagination = PaginationResponse.builder()
                .currentPage(page.getNumber() + 1)
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .pageSize(page.getSize())
                .isLast(page.isLast())
                .isFirst(page.isFirst())
                .build();

        return PageResponse.<InventoryResponse>builder()
                .success(true)
                .code("INVENTORY_LIST_FETCHED")
                .message("Fetch inventory successfully")
                .data(toResponseList(page.getContent()))
                .pagination(pagination)
                .build();
    }
}
