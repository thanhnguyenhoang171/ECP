package com.example.ecp_api.dto.response;

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
public class AuditLogResponse {
    @Schema(description = "Log entry ID", example = "65f1a2b3c4d5e6f7a8b9c0d1")
    private String id;

    @Schema(description = "Type of action performed", example = "CREATE_PRODUCT")
    private String action;

    @Schema(description = "Username of the person who performed the action", example = "admin")
    private String username;

    @Schema(description = "Detailed information about the action", example = "Created product: iPhone 15")
    private String details;

    @Schema(description = "Time when the action was performed")
    private LocalDateTime timestamp;
}
