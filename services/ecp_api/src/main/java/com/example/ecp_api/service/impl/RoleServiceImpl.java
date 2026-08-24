package com.example.ecp_api.service.impl;

import com.example.ecp_api.dto.request.RoleRequest;
import com.example.ecp_api.dto.response.PermissionResponse;
import com.example.ecp_api.dto.response.RoleResponse;
import com.example.ecp_api.entity.jpa.Permission;
import com.example.ecp_api.entity.jpa.Role;
import com.example.ecp_api.exception.AppException;
import com.example.ecp_api.repository.jpa.PermissionRepository;
import com.example.ecp_api.repository.jpa.RoleRepository;
import com.example.ecp_api.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RoleResponse> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(this::mapToRoleResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public RoleResponse getRoleByCode(String code) {
        Role role = roleRepository.findByCode(code)
                .orElseThrow(() -> new AppException("NOT_FOUND", "Role not found with code: " + code, HttpStatus.NOT_FOUND));
        return mapToRoleResponse(role);
    }

    @Override
    @Transactional
    public RoleResponse createRole(RoleRequest request) {
        if (roleRepository.existsByCode(request.getCode())) {
            throw new AppException("CONFLICT", "Role code already exists: " + request.getCode(), HttpStatus.CONFLICT);
        }

        Set<Permission> permissions = new HashSet<>();
        if (request.getPermissionCodes() != null && !request.getPermissionCodes().isEmpty()) {
            permissions = permissionRepository.findByCodeIn(request.getPermissionCodes());
        }

        Role role = Role.builder()
                .code(request.getCode().toUpperCase())
                .name(request.getName())
                .description(request.getDescription())
                .isSystem(false)
                .permissions(permissions)
                .build();

        return mapToRoleResponse(roleRepository.save(role));
    }

    @Override
    @Transactional
    public RoleResponse updateRole(UUID id, RoleRequest request) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new AppException("NOT_FOUND", "Role not found with ID: " + id, HttpStatus.NOT_FOUND));

        if (role.isSystem() && !role.getCode().equalsIgnoreCase(request.getCode())) {
            throw new AppException("FORBIDDEN", "System roles cannot have their code changed", HttpStatus.FORBIDDEN);
        }

        Set<Permission> permissions = new HashSet<>();
        if (request.getPermissionCodes() != null && !request.getPermissionCodes().isEmpty()) {
            permissions = permissionRepository.findByCodeIn(request.getPermissionCodes());
        }

        role.setName(request.getName());
        role.setDescription(request.getDescription());
        role.setPermissions(permissions);

        return mapToRoleResponse(roleRepository.save(role));
    }

    @Override
    @Transactional
    public void deleteRole(UUID id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new AppException("NOT_FOUND", "Role not found with ID: " + id, HttpStatus.NOT_FOUND));

        if (role.isSystem()) {
            throw new AppException("FORBIDDEN", "System roles cannot be deleted", HttpStatus.FORBIDDEN);
        }

        roleRepository.delete(role);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PermissionResponse> getAllPermissions() {
        return permissionRepository.findAll().stream()
                .map(this::mapToPermissionResponse)
                .collect(Collectors.toList());
    }

    private RoleResponse mapToRoleResponse(Role role) {
        Set<PermissionResponse> permissionResponses = role.getPermissions().stream()
                .map(this::mapToPermissionResponse)
                .collect(Collectors.toSet());

        return RoleResponse.builder()
                .id(role.getId())
                .code(role.getCode())
                .name(role.getName())
                .description(role.getDescription())
                .isSystem(role.isSystem())
                .permissions(permissionResponses)
                .build();
    }

    private PermissionResponse mapToPermissionResponse(Permission permission) {
        return PermissionResponse.builder()
                .id(permission.getId())
                .code(permission.getCode())
                .name(permission.getName())
                .module(permission.getModule())
                .description(permission.getDescription())
                .build();
    }
}
