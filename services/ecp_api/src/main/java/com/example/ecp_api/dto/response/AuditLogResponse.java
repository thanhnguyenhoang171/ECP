package com.example.ecp_api.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response object representing a system audit log entry")
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuditLogResponse {
    @Schema(description = "Log entry ID", example = "65f1a2b3c4d5e6f7a8b9c0d1")
    private String id;

    @Schema(description = "Type of action performed", example = "CREATE_PRODUCT")
    private String action;

    @Schema(description = "Email of the person who performed the action", example = "admin@example.com")
    private String email;

    @Schema(description = "Detailed information about the action", example = "Created product: iPhone 15")
    private String details;

    @Schema(description = "Time when the action was performed")
    private LocalDateTime timestamp;

    @Schema(description = "Type of log: SYSTEM, ADMIN, MANAGER, or USER")
    private String logType;

    @Schema(description = "Module: SYSTEM (Auth, Users) or MANAGEMENT (Products, Orders)")
    private String module;

    @Schema(description = "Category: SYSTEM or MANAGEMENT")
    private String category;

    @Schema(description = "Domain: AUTH, USER, ROLE, PRODUCT, WAREHOUSE, PURCHASE_ORDER, etc.")
    private String domain;

    private String ipAddress;
    private String userAgent;
    private String status;
}
