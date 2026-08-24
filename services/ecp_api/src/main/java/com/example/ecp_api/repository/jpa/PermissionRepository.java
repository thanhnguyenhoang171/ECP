package com.example.ecp_api.repository.jpa;

import com.example.ecp_api.entity.jpa.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, UUID> {
    Optional<Permission> findByCode(String code);
    boolean existsByCode(String code);
    Set<Permission> findByCodeIn(Set<String> codes);
    List<Permission> findByModule(String module);
}
