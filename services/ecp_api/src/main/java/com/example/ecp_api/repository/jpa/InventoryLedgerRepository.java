package com.example.ecp_api.repository.jpa;

import com.example.ecp_api.entity.jpa.InventoryLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InventoryLedgerRepository extends JpaRepository<InventoryLedger, UUID>, JpaSpecificationExecutor<InventoryLedger> {
    List<InventoryLedger> findByWarehouseIdAndSkuIdAndBatchCodeOrderByCreatedAtDesc(UUID warehouseId, UUID skuId, String batchCode);
}
