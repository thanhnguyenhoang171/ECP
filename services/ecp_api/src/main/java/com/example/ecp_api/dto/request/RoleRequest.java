package com.example.ecp_api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleRequest {

    @NotBlank(message = "Role code cannot be blank")
    @Size(max = 50, message = "Role code must not exceed 50 characters")
    @jakarta.validation.constraints.Pattern(regexp = "[A-Z0-9_]+", message = "Mã vai trò chỉ gồm chữ hoa, số và gạch dưới")
    private String code;

    @NotBlank(message = "Role name cannot be blank")
    @Size(max = 100, message = "Role name must not exceed 100 characters")
    private String name;

    @Size(max = 255)
    private String description;

    private Set<String> permissionCodes;
}
