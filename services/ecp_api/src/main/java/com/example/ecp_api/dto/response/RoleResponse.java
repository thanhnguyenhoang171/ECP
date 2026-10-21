package com.example.ecp_api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleResponse {
    private String createdBy;
    private String updatedBy;

    private UUID id;
    private String code;
    private String name;
    private String description;
    private boolean isSystem;
    private boolean editable;
    private boolean deletable;
    private Set<PermissionResponse> permissions;
}
