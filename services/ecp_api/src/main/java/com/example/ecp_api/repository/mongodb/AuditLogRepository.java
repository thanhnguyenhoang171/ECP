package com.example.ecp_api.repository.mongodb;

import com.example.ecp_api.entity.mongodb.AuditLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends MongoRepository<AuditLog, String> {
    @Query("{ '$or': [ { 'email': ?0 }, { 'username': ?0 } ] }")
    List<AuditLog> findByEmail(String email);

    List<AuditLog> findByUsername(String username);

    void deleteByTimestampBefore(java.time.LocalDateTime expiryDate);
}
