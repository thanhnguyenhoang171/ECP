package com.example.ecp_api.dto.request;

import com.example.ecp_api.enums.users.UserGender;
import com.example.ecp_api.enums.users.UserRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRequest {
    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Email is invalid")
    private String email;

    @NotBlank(message = "Password cannot be blank")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @Pattern(regexp = "^(0[3|5|7|8|9])+([0-9]{8})$", message = "Phone number is invalid")
    private String phoneNumber;

    @Size(max = 100, message = "First name must not exceed 100 characters")
    private String firstName;

    @Size(max = 100, message = "Last name must not exceed 100 characters")
    private String lastName;

    @Past(message = "Date of birth must be in the past")
    private LocalDate dob;

    private UserGender gender;

    private UserRole role;

    private Boolean active;

    private String avatarUrl;

    private String avatarPublicId;
}