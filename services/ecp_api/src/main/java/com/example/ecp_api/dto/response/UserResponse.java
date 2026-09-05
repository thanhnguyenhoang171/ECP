package com.example.ecp_api.dto.response;

import com.example.ecp_api.enums.users.MembershipTier;
import com.example.ecp_api.enums.users.UserGender;
import com.example.ecp_api.enums.users.UserRole;
import com.fasterxml.jackson.annotation.JsonProperty;
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

    @Schema(description = "Email address", example = "john.doe@example.com")
    private String email;

    @Schema(description = "Phone number", example = "0987654321")
    private String phoneNumber;

    @Schema(description = "User roles in the system", example = "[\"SUPER_ADMIN\", \"MANAGER\"]")
    private java.util.Set<String> roles;

    @Schema(description = "User's first name", example = "John")
    private String firstName;

    @Schema(description = "User's last name", example = "Doe")
    private String lastName;

    @Schema(description = "URL to user's avatar image")
    private String avatarUrl;

    @Schema(description = "Cloudinary public ID for avatar")
    private String avatarPublicId;

    @Schema(description = "URL to user's cover banner image")
    private String bannerUrl;

    @Schema(description = "Cloudinary public ID for banner")
    private String bannerPublicId;

    @Schema(description = "Date of birth")
    private LocalDate dob;

    @Schema(description = "User gender")
    private UserGender gender;

    @Schema(description = "Authentication provider (e.g. LOCAL, GOOGLE)", example = "LOCAL")
    private String provider;

    @Schema(description = "Account status", example = "true")
    private boolean isActive;

    @Schema(description = "Email verified?", example = "true")
    private boolean isEmailVerified;

    @Schema(description = "Phone verification status", example = "false")
    private boolean isPhoneVerified;

    @Schema(description = "Is user currently online in session?", example = "true")
    @JsonProperty("isOnline")
    private boolean isOnline;

    public boolean getIsOnline() {
        return isOnline;
    }

    public void setIsOnline(boolean isOnline) {
        this.isOnline = isOnline;
    }

    @Schema(description = "User last login timestamp")
    private LocalDateTime lastLoginAt;

//    @Schema(description = "Cumulative loyalty points", example = "150")
//    private Integer loyaltyPoints;
//
//    @Schema(description = "User's membership tier")
//    private MembershipTier membershipTier;

    @Schema(description = "Account creation timestamp")
    private LocalDateTime createdAt;

    @Schema(description = "Account last update timestamp")
    private LocalDateTime updatedAt;

    @Schema(description = "Email of the user who created this account")
    private String createdBy;

    @Schema(description = "Email of the user who last updated this account")
    private String updatedBy;
}
