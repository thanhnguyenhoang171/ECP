package com.example.ecp_api.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Filter parameters for user list")
public class UserFilterRequest {
    @Schema(description = "Search keyword in full name, email, or phone number", example = "admin")
    private String keyword;

    @Schema(description = "User email address", example = "admin@example.com")
    private String email;

    @Schema(description = "Single role code filter", example = "ROLE_SUPER_ADMIN")
    private String role;

    @Schema(description = "Multiple role codes filter")
    private List<String> roles;

    @Schema(description = "Account active status filter", example = "true")
    private Boolean active;
}
