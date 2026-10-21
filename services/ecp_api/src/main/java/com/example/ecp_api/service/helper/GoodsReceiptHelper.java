package com.example.ecp_api.service.helper;
import com.example.ecp_api.security.DataOwnership;

import com.example.ecp_api.dto.request.GoodsReceiptRequest;
import com.example.ecp_api.entity.jpa.GoodsReceipt;
import com.example.ecp_api.entity.jpa.GoodsReceiptItem;
import com.example.ecp_api.entity.jpa.Sku;
import com.example.ecp_api.exception.AppException;
import com.example.ecp_api.repository.jpa.SkuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class GoodsReceiptHelper {

    private final org.springframework.data.mongodb.core.MongoTemplate ownershipMongo;
    private final SkuRepository skuRepository;

    public void processGoodsReceiptItems(GoodsReceiptRequest request, GoodsReceipt goodsReceipt) {
        if (request.getItems() != null) {
            goodsReceipt.getItems().clear();
            for (GoodsReceiptRequest.GoodsReceiptItemDto itemDto : request.getItems()) {
                Sku sku = skuRepository.findById(UUID.fromString(itemDto.getSkuId()))
                        .orElseThrow(() -> new AppException("SKU_NOT_FOUND", "Không tìm thấy SKU ID: " + itemDto.getSkuId(), HttpStatus.NOT_FOUND));

                DataOwnership.requireSku(sku, ownershipMongo);
                if (!sku.isActive()) {
                    throw new AppException("SKU_INACTIVE", "SKU đã ngừng hoạt động.", HttpStatus.BAD_REQUEST);
                }
                if (itemDto.getManufactureDate() != null && itemDto.getExpiryDate() != null
                        && !itemDto.getExpiryDate().isAfter(itemDto.getManufactureDate())) {
                    throw new AppException("INVALID_EXPIRY_DATE", "Hạn sử dụng phải sau ngày sản xuất.", HttpStatus.BAD_REQUEST);
                }
                GoodsReceiptItem grItem = GoodsReceiptItem.builder()
                        .sku(sku)
                        .goodsReceipt(goodsReceipt)
                        .batchCode(itemDto.getBatchCode() == null ? "" : itemDto.getBatchCode().trim())
                        .manufactureDate(itemDto.getManufactureDate())
                        .expiryDate(itemDto.getExpiryDate())
                        .quantity(itemDto.getQuantity())
                        .unitCost(itemDto.getUnitCost())
                        .build();

                goodsReceipt.getItems().add(grItem);
            }
        }
    }
}
