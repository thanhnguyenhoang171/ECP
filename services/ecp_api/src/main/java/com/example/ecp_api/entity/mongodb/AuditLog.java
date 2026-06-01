package com.example.ecp_api.entity.mongodb;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.TypeAlias;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "audit_logs")
@TypeAlias("base")
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public abstract class AuditLog {
    @Id
    private String id;
    private String action;
    private String username;
    private String details;
    private LocalDateTime timestamp;
}
