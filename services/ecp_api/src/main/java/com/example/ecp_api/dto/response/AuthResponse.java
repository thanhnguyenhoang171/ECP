package com.example.ecp_api.dto.response;

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
@Schema(description = "Response object containing authentication tokens and user info")
public class AuthResponse {
    @Schema(description = "User ID", example = "550e8400-e29b-41d4-a716-446655440000")
    private String id;

    @Schema(description = "JWT Access Token")
    private String accessToken;

    @Schema(description = "JWT Refresh Token")
    private String refreshToken;

    @Schema(description = "Username", example = "admin")
    private String username;

    @Schema(description = "Email address", example = "admin@example.com")
    private String email;

    @Schema(description = "List of user roles", example = "[\"ROLE_USER\", \"ROLE_ADMIN\"]")
    private List<String> roles;
}
