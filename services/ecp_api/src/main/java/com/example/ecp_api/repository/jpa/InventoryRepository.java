package com.example.ecp_api.repository.jpa;

import com.example.ecp_api.entity.jpa.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, UUID>, JpaSpecificationExecutor<Inventory> {
    Optional<Inventory> findByWarehouseIdAndSkuIdAndBatchCode(UUID warehouseId, UUID skuId, String batchCode);
    boolean existsByWarehouseId(UUID warehouseId);
}
