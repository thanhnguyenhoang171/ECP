package com.example.ecp_api.repository.jpa;

import com.example.ecp_api.entity.jpa.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, UUID>, JpaSpecificationExecutor<Warehouse> {
    boolean existsByCode(String code);
    boolean existsByName(String name);
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select e from Warehouse e where e.id = :id")
    java.util.Optional<Warehouse> findForUpdate(@org.springframework.data.repository.query.Param("id") UUID id);

}
