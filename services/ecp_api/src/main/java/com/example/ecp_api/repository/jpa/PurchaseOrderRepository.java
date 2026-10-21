package com.example.ecp_api.repository.jpa;

import com.example.ecp_api.entity.jpa.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, UUID>, JpaSpecificationExecutor<PurchaseOrder> {
    boolean existsByPoCode(String poCode);
    boolean existsByWarehouseId(UUID warehouseId);
    boolean existsBySupplierId(UUID supplierId);
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select e from PurchaseOrder e where e.id = :id")
    java.util.Optional<PurchaseOrder> findForUpdate(@org.springframework.data.repository.query.Param("id") UUID id);

    @org.springframework.data.jpa.repository.Query("select distinct e from PurchaseOrder e left join fetch e.items it left join fetch it.sku left join fetch e.supplier order by e.createdAt desc")
    java.util.List<PurchaseOrder> findAllWithItemsAndSupplier();

    boolean existsByWarehouseIdAndDeletedAtIsNull(java.util.UUID warehouseId);
    boolean existsBySupplierIdAndDeletedAtIsNull(java.util.UUID supplierId);
}
