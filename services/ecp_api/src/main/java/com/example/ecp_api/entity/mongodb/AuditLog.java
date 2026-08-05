package com.example.ecp_api.entity.mongodb;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "audit_logs")
@CompoundIndexes({
        @CompoundIndex(name = "idx_module_timestamp", def = "{'module': 1, 'timestamp': -1}"),
        @CompoundIndex(name = "idx_username_timestamp", def = "{'username': 1, 'timestamp': -1}"),
        @CompoundIndex(name = "idx_domain_timestamp", def = "{'domain': 1, 'timestamp': -1}")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {
    @Id
    private String id;

    @Indexed
    private String action;

    @Indexed
    private String username;

    private String details;
    private LocalDateTime timestamp;
    private String logType;

    @Indexed
    private String module;

    private String category;
    private String domain;
    private String ipAddress;
    private String userAgent;
    private String status;
}