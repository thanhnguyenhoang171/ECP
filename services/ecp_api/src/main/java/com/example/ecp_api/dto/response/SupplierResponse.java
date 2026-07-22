package com.example.ecp_api.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Response object representing a supplier")
public class SupplierResponse {
    @Schema(description = "Unique supplier ID")
    private String id;

    @Schema(description = "Supplier name")
    private String name;

    @Schema(description = "Contact person name")
    private String contactName;

    @Schema(description = "Phone number")
    private String phone;

    @Schema(description = "Email address")
    private String email;

    @Schema(description = "Physical address")
    private String address;

    @Schema(description = "Tax code")
    private String taxCode;

    @Schema(description = "Active status")
    private boolean isActive;

    @Schema(description = "Creation timestamp")
    private LocalDateTime createdAt;

    @Schema(description = "Last update timestamp")
    private LocalDateTime updatedAt;

    @Schema(description = "Creator username")
    private String createdBy;

    @Schema(description = "Last updater username")
    private String updatedBy;
}
