package com.example.ecp_api.repository.jpa;

import com.example.ecp_api.entity.jpa.Sku;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SkuRepository  extends JpaRepository<Sku, UUID>, JpaSpecificationExecutor<Sku> {
    boolean existsBySkuCode(String skuCode);
}
