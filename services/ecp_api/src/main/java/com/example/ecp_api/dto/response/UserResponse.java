package com.example.ecp_api.dto.response;

import com.example.ecp_api.enums.users.MembershipTier;
import com.example.ecp_api.enums.users.UserGender;
import com.example.ecp_api.enums.users.UserRole;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response object containing detailed user and profile information")
public class UserResponse {
    @Schema(description = "Unique user ID (UUID)", example = "550e8400-e29b-41d4-a716-446655440000")
    private UUID id;

    @Schema(description = "Account username", example = "johndoe")
    private String username;

    @Schema(description = "Email address", example = "john.doe@example.com")
    private String email;

    @Schema(description = "Phone number", example = "0987654321")
    private String phoneNumber;

    @Schema(description = "User role in the system")
    private UserRole role;

    @Schema(description = "Account status", example = "true")
    private boolean isActive;

    @Schema(description = "User's first name", example = "John")
    private String firstName;

    @Schema(description = "User's last name", example = "Doe")
    private String lastName;

    @Schema(description = "URL to user's avatar image")
    private String avatarUrl;

    @Schema(description = "Date of birth")
    private LocalDate dob;

    @Schema(description = "User gender")
    private UserGender gender;

    @Schema(description = "Cumulative loyalty points", example = "150")
    private Integer loyaltyPoints;

    @Schema(description = "User's membership tier")
    private MembershipTier membershipTier;

    @Schema(description = "Account creation timestamp")
    private LocalDateTime createdAt;

    @Schema(description = "Account last update timestamp")
    private LocalDateTime updatedAt;
}
