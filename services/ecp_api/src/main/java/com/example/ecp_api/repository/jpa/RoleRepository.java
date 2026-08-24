package com.example.ecp_api.repository.jpa;

import com.example.ecp_api.entity.jpa.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
public interface RoleRepository extends JpaRepository<Role, UUID> {
    Optional<Role> findByCode(String code);
    Set<Role> findByCodeIn(Set<String> codes);
    boolean existsByCode(String code);
}
