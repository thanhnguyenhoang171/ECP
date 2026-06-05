package com.example.ecp_api.repository.jpa;

import com.example.ecp_api.entity.jpa.PurchaseOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PurchaseOrderItemRepository extends JpaRepository<PurchaseOrderItem, UUID>, JpaSpecificationExecutor<PurchaseOrderItem> {
    boolean existsByPurchaseOrderIdAndSkuId(UUID purchaseOrderId, UUID skuId);
    boolean existsByPurchaseOrderIdAndSkuIdAndIdNot(UUID purchaseOrderId, UUID skuId, UUID id);
}
