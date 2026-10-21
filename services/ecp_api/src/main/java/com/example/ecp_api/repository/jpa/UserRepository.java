package com.example.ecp_api.repository.jpa;

import com.example.ecp_api.entity.jpa.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID>, JpaSpecificationExecutor<User> {
    Optional<User> findByEmail(String email);
    boolean existsByRolesId(UUID roleId);
    boolean existsByEmail(String email);
    long countByRolesCodeIn(Collection<String> roleCodes);
    long countByRolesCode(String roleCode);
    long countByDeletedAtIsNullAndActiveTrueAndRolesCode(String roleCode);
    boolean existsByIdAndRolesCode(UUID id, String roleCode);
    boolean existsByProfileAvatarUrlAndIdNot(String avatarUrl, UUID id);
}
