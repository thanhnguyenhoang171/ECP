package com.example.ecp_api.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.util.StringUtils;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Filter parameters for retrieving audit logs")
public class AuditLogFilterRequest {
    @Schema(description = "Keyword search in action, email, details, ipAddress", example = "admin")
    private String keyword;

    @Schema(description = "Action code filter (e.g. PRODUCT_CREATE, AUTH_LOGIN)", example = "PRODUCT_CREATE")
    private String action;

    @Schema(description = "Email of the actor performing the action", example = "admin@example.com")
    private String email;

    @Schema(description = "Actor role type filter: SYSTEM, ADMIN, MANAGER, USER", example = "ADMIN")
    private String logType;

    @Schema(description = "Module filter: SYSTEM or MANAGEMENT", example = "MANAGEMENT")
    private String module;

    @Schema(description = "Category filter: SYSTEM or MANAGEMENT", example = "MANAGEMENT")
    private String category;

    @Schema(description = "Domain filter: AUTH, USER, CATALOG, INVENTORY, PURCHASE_ORDER, SALES_ORDER, FINANCE, PROMOTION, CUSTOMER", example = "CATALOG")
    private String domain;
}
