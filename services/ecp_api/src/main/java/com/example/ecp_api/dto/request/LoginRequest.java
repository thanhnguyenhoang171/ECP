package com.example.ecp_api.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "User login credentials")
public class LoginRequest {
    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Email is invalid")
    @Schema(description = "Account email", example = "admin@ecp.com", requiredMode = Schema.RequiredMode.REQUIRED)
    private String email;

    @NotBlank(message = "Password cannot be blank")
    @Schema(description = "Account password", example = "admin123", requiredMode = Schema.RequiredMode.REQUIRED)
    private String password;

    // Helper for backward compatibility with Spring Security loadUserByUsername
    public String getUsername() {
        return email;
    }
}
