package com.example.ecp_api.controller.user;

import com.example.ecp_api.dto.request.RoleRequest;
import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.dto.response.PermissionResponse;
import com.example.ecp_api.dto.response.RoleResponse;
import com.example.ecp_api.service.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v1/roles")
@RequiredArgsConstructor
@Tag(name = "Roles", description = "Role & Permission Management APIs")
public class RoleController {

    private final RoleService roleService;

    @GetMapping
    @PreAuthorize("hasAuthority('role:read') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Get all system and custom roles with permissions")
    public ResponseEntity<ApiResponse<List<RoleResponse>>> getAllRoles() {
        return ResponseEntity.ok(ApiResponse.<List<RoleResponse>>builder()
                .success(true)
                .code("ROLES_FETCHED_SUCCESS")
                .message("Roles fetched successfully")
                .data(roleService.getAllRoles())
                .build());
    }

    @GetMapping("/permissions")
    @PreAuthorize("hasAuthority('role:read') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Get all available system permissions")
    public ResponseEntity<ApiResponse<List<PermissionResponse>>> getAllPermissions() {
        return ResponseEntity.ok(ApiResponse.<List<PermissionResponse>>builder()
                .success(true)
                .code("PERMISSIONS_FETCHED_SUCCESS")
                .message("Permissions fetched successfully")
                .data(roleService.getAllPermissions())
                .build());
    }

    @GetMapping("/{code}")
    @PreAuthorize("hasAuthority('role:read') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Get role details by role code")
    public ResponseEntity<ApiResponse<RoleResponse>> getRoleByCode(@PathVariable String code) {
        return ResponseEntity.ok(ApiResponse.<RoleResponse>builder()
                .success(true)
                .code("ROLE_FETCHED_SUCCESS")
                .message("Role fetched successfully")
                .data(roleService.getRoleByCode(code))
                .build());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('role:create') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Create a new custom system role with assigned permissions")
    public ResponseEntity<ApiResponse<RoleResponse>> createRole(@Valid @RequestBody RoleRequest request) {
        return new ResponseEntity<>(ApiResponse.<RoleResponse>builder()
                .success(true)
                .code("ROLE_CREATED_SUCCESS")
                .message("Role created successfully")
                .data(roleService.createRole(request))
                .build(), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('role:update') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Update an existing role and its permissions")
    public ResponseEntity<ApiResponse<RoleResponse>> updateRole(
            @PathVariable UUID id, @Valid @RequestBody RoleRequest request) {
        return ResponseEntity.ok(ApiResponse.<RoleResponse>builder()
                .success(true)
                .code("ROLE_UPDATED_SUCCESS")
                .message("Role updated successfully")
                .data(roleService.updateRole(id, request))
                .build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('role:delete') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Delete a custom system role")
    public ResponseEntity<ApiResponse<Void>> deleteRole(@PathVariable UUID id) {
        roleService.deleteRole(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .code("ROLE_DELETED_SUCCESS")
                .message("Role deleted successfully")
                .build());
    }
}
