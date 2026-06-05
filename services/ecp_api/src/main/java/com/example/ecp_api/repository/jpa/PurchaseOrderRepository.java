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
}
