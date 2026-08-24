package com.example.ecp_api.controller.user;

import com.example.ecp_api.dto.request.PermissionRequest;
import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.dto.response.PermissionResponse;
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
import java.util.Map;

@RestController
@RequestMapping("/v1/permissions")
@RequiredArgsConstructor
@Tag(name = "Permissions", description = "System & Custom Permission Management APIs")
public class PermissionController {

    private final RoleService roleService;

    @GetMapping
    @PreAuthorize("hasAuthority('role:read') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Get all system and custom permissions")
    public ResponseEntity<ApiResponse<List<PermissionResponse>>> getAllPermissions() {
        return ResponseEntity.ok(ApiResponse.<List<PermissionResponse>>builder()
                .success(true)
                .code("PERMISSIONS_FETCHED_SUCCESS")
                .message("Permissions fetched successfully")
                .data(roleService.getAllPermissions())
                .build());
    }

    @GetMapping("/grouped")
    @PreAuthorize("hasAuthority('role:read') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Get all permissions grouped by functional module (PRODUCT, USER, ROLE, INVENTORY, etc.)")
    public ResponseEntity<ApiResponse<Map<String, List<PermissionResponse>>>> getGroupedPermissions() {
        return ResponseEntity.ok(ApiResponse.<Map<String, List<PermissionResponse>>>builder()
                .success(true)
                .code("GROUPED_PERMISSIONS_FETCHED_SUCCESS")
                .message("Grouped permissions fetched successfully")
                .data(roleService.getGroupedPermissions())
                .build());
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Create a new dynamic custom permission (SUPER_ADMIN only)")
    public ResponseEntity<ApiResponse<PermissionResponse>> createPermission(@Valid @RequestBody PermissionRequest request) {
        return new ResponseEntity<>(ApiResponse.<PermissionResponse>builder()
                .success(true)
                .code("PERMISSION_CREATED_SUCCESS")
                .message("Permission created successfully")
                .data(roleService.createPermission(request))
                .build(), HttpStatus.CREATED);
    }
}
