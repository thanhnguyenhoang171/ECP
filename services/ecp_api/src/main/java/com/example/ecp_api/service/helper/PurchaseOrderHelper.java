package com.example.ecp_api.service.helper;

import com.example.ecp_api.dto.request.PurchaseOrderRequest;
import com.example.ecp_api.entity.jpa.PurchaseOrder;
import com.example.ecp_api.entity.jpa.PurchaseOrderItem;
import com.example.ecp_api.entity.jpa.Sku;
import com.example.ecp_api.exception.AppException;
import com.example.ecp_api.repository.jpa.SkuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class PurchaseOrderHelper {

    private final SkuRepository skuRepository;

    public void processPurchaseOrderItems(PurchaseOrderRequest request, PurchaseOrder purchaseOrder) {
        if (request.getItems() != null) {
            purchaseOrder.getItems().clear();
            for (PurchaseOrderRequest.PurchaseOrderItemDto itemDto : request.getItems()) {
                Sku sku = skuRepository.findById(UUID.fromString(itemDto.getSkuId()))
                        .orElseThrow(() -> new AppException("SKU_NOT_FOUND", "Không tìm thấy SKU ID: " + itemDto.getSkuId(), HttpStatus.NOT_FOUND));

                PurchaseOrderItem poItem = PurchaseOrderItem.builder()
                        .sku(sku)
                        .purchaseOrder(purchaseOrder)
                        .orderQuantity(itemDto.getOrderQuantity())
                        .unitPrice(itemDto.getUnitPrice())
                        .receivedQuantity(0)
                        .build();

                purchaseOrder.getItems().add(poItem);
            }
        }
    }
}
