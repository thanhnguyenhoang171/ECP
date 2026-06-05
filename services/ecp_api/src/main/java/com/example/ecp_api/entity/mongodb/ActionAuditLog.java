package com.example.ecp_api.entity.mongodb;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.TypeAlias;

@TypeAlias("action")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ActionAuditLog extends AuditLog {
    private String resourceType; // PRODUCT, WAREHOUSE, etc.
    private String resourceId;
    private String changeDetails; // JSON or descriptive string
}
