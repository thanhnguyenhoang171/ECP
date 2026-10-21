package com.example.ecp_api.dto.request;

import com.example.ecp_api.enums.users.UserGender;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserUpdateRequest {

    @Pattern(regexp = "^$|^0[35789][0-9]{8}$", message = "Phone number is invalid")
    private String phoneNumber;

    @Size(max = 100, message = "First name must not exceed 100 characters")
    private String firstName;

    @Size(max = 100, message = "Last name must not exceed 100 characters")
    private String lastName;

    @Past(message = "Date of birth must be in the past")
    private LocalDate dob;

    private UserGender gender;

    private java.util.Set<String> roles;

    public void setRole(String role) {
        if (role != null && !role.trim().isEmpty()) {
            if (this.roles == null) {
                this.roles = new java.util.HashSet<>();
            }
            this.roles.add(role.trim().toUpperCase());
        }
    }

    private Boolean active;

    @Size(min = 8, max = 72, message = "Password must be between 8 and 72 characters")
    private String password;

    private String avatarUrl;

    private String avatarPublicId;
}
