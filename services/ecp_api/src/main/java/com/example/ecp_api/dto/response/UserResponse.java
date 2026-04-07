package com.example.ecp_api.dto.response;

import com.example.ecp_api.enums.users.MembershipTier;
import com.example.ecp_api.enums.users.UserGender;
import com.example.ecp_api.enums.users.UserRole;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private UUID id;
    private String username;
    private String email;
    private String phoneNumber;
    private UserRole role;
    private boolean isActive;

    // From UserProfile
    private String firstName;
    private String lastName;
    private String avatarUrl;
    private LocalDate dob;
    private UserGender gender;
    private Integer loyaltyPoints;
    private MembershipTier membershipTier;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
