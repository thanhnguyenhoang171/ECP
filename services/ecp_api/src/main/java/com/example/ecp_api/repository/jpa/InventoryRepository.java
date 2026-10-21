package com.example.ecp_api.repository.jpa;

import com.example.ecp_api.entity.jpa.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, UUID>, JpaSpecificationExecutor<Inventory> {
    @Query("SELECT i FROM Inventory i WHERE i.warehouse.id = :warehouseId AND i.sku.id = :skuId "
            + "AND (i.batchCode = :batchCode OR (:batchCode = '' AND i.batchCode IS NULL))")
    Optional<Inventory> findByWarehouseIdAndSkuIdAndBatchCode(
            @org.springframework.data.repository.query.Param("warehouseId") UUID warehouseId,
            @org.springframework.data.repository.query.Param("skuId") UUID skuId,
            @org.springframework.data.repository.query.Param("batchCode") String batchCode);
    boolean existsByWarehouseId(UUID warehouseId);

    @Query("SELECT COALESCE(SUM(i.quantityOnHand), 0) FROM Inventory i WHERE i.sku.id = :skuId")
    Integer sumQuantityOnHandBySkuId(@org.springframework.data.repository.query.Param("skuId") UUID skuId);

    @Query("SELECT COUNT(i) FROM Inventory i WHERE i.quantityOnHand <= :threshold")
    long countByLowStockThreshold(@org.springframework.data.repository.query.Param("threshold") int threshold);

    @Query("SELECT i FROM Inventory i JOIN FETCH i.sku ORDER BY i.quantityOnHand DESC")
    java.util.List<Inventory> findTopByOrderByQuantityOnHandDesc();
}
