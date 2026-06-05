package com.example.ecp_api.repository.jpa;

import com.example.ecp_api.entity.jpa.GoodsReceipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface GoodsReceiptRepository extends JpaRepository<GoodsReceipt, UUID>, JpaSpecificationExecutor<GoodsReceipt> {
    Optional<GoodsReceipt> findByReceiptCode(String receiptCode);
    boolean existsByReceiptCode(String receiptCode);
    boolean existsByWarehouseId(UUID warehouseId);
}
