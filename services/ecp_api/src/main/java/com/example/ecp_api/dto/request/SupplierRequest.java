package com.example.ecp_api.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request for creating or updating a supplier")
public class SupplierRequest {
    @NotBlank(message = "Supplier name is required")
    @Schema(description = "Full name of the supplier", example = "Công ty TNHH Cung ứng ABC")
    private String name;

    @Schema(description = "Name of the contact person", example = "Nguyễn Văn A")
    private String contactName;

    @Schema(description = "Phone number of the supplier", example = "0987654321")
    private String phone;

    @Email(message = "Invalid email format")
    @Schema(description = "Email address of the supplier", example = "contact@abc-supplier.com")
    private String email;

    @Schema(description = "Physical address of the supplier", example = "123 Đường ABC, Quận 1, TP. HCM")
    private String address;

    @Schema(description = "Tax code of the supplier", example = "0101234567")
    private String taxCode;

    @Builder.Default
    @Schema(description = "Active status", example = "true")
    private Boolean isActive = true;
}
