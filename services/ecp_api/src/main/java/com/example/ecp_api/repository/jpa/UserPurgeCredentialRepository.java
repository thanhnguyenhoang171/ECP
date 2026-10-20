package com.example.ecp_api.repository.jpa;

import com.example.ecp_api.entity.jpa.UserPurgeCredential;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface UserPurgeCredentialRepository extends JpaRepository<UserPurgeCredential, UUID> {
}
