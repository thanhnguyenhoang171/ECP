package com.example.ecp_api.entity.mongodb;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.TypeAlias;

@TypeAlias("auth")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class AuthAuditLog extends AuditLog {
    private String ipAddress;
    private String userAgent;
    private String status; // SUCCESS, FAILED
}
