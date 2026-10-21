package com.example.ecp_api.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PermissionRequest {

    @NotBlank(message = "Permission code is required")
    @jakarta.validation.constraints.Size(max = 100)
    @jakarta.validation.constraints.Pattern(regexp = "[a-z][a-z0-9_]*:[a-z][a-z0-9_]*", message = "Mã quyền phải có dạng module:action")
    private String code;

    @NotBlank(message = "Permission name is required")
    @jakarta.validation.constraints.Size(min = 2, max = 100)
    private String name;

    @NotBlank(message = "Module is required")
    @jakarta.validation.constraints.Size(max = 50)
    @jakarta.validation.constraints.Pattern(regexp = "[A-Z][A-Z0-9_]*")
    private String module;

    @jakarta.validation.constraints.Size(max = 255)
    private String description;
}
