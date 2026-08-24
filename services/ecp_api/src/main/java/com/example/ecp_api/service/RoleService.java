package com.example.ecp_api.service;

import com.example.ecp_api.dto.request.RoleRequest;
import com.example.ecp_api.dto.response.PermissionResponse;
import com.example.ecp_api.dto.response.RoleResponse;

import java.util.List;
import java.util.UUID;

public interface RoleService {
    List<RoleResponse> getAllRoles();
    RoleResponse getRoleByCode(String code);
    RoleResponse createRole(RoleRequest request);
    RoleResponse updateRole(UUID id, RoleRequest request);
    void deleteRole(UUID id);
    List<PermissionResponse> getAllPermissions();
}
