package com.example.ecp_api.dto.request;

import com.example.ecp_api.enums.users.UserGender;
import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "Request body for updating current user profile details")
public class UpdateMyAccountRequest {

    @Schema(description = "Phone number of the user (Vietnamese format)", example = "0987654321")
    @Pattern(regexp = "^(0[3|5|7|8|9])+([0-9]{8})$", message = "Phone number is invalid")
    private String phoneNumber;

    @Schema(description = "First name", example = "John")
    @Size(max = 100, message = "First name must not exceed 100 characters")
    private String firstName;

    @Schema(description = "Last name", example = "Doe")
    @Size(max = 100, message = "Last name must not exceed 100 characters")
    private String lastName;

    @Schema(description = "Date of birth (ISO-8601 format: YYYY-MM-DD)", example = "1995-05-15")
    @Past(message = "Date of birth must be in the past")
    private LocalDate dob;

    @Schema(description = "Gender of the user", example = "MALE")
    private UserGender gender;

    @Schema(description = "URL to user's avatar image")
    private String avatarUrl;

    @Schema(description = "Cloudinary public ID for avatar")
    private String avatarPublicId;

    @Schema(description = "URL to user's cover banner image")
    private String bannerUrl;

    @Schema(description = "Cloudinary public ID for banner")
    private String bannerPublicId;
}
