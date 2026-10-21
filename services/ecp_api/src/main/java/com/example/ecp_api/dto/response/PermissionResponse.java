package com.example.ecp_api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PermissionResponse {
    private String createdBy;
    private String updatedBy;

    private UUID id;
    private boolean system;
    private boolean editable;
    private boolean deletable;
    private String code;
    private String name;
    private String module;
    private String description;
}
