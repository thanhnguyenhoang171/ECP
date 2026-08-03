package com.example.ecp_api.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Google OAuth login request containing credential ID token")
public class GoogleLoginRequest {
    @NotBlank(message = "ID Token cannot be blank")
    @Schema(description = "Google ID token received from Google Sign-In", requiredMode = Schema.RequiredMode.REQUIRED)
    private String idToken;
}
