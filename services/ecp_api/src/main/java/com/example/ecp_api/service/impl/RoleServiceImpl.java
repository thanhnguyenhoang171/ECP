package com.example.ecp_api.service.impl;
import com.example.ecp_api.security.DataOwnership;
import com.example.ecp_api.util.SecurityUtils;

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
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@lombok.extern.slf4j.Slf4j
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final com.example.ecp_api.repository.jpa.UserRepository userRepository;
    private final com.example.ecp_api.service.AuditLogService auditLogService;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RoleResponse> getAllRoles() {
        return roleRepository.findAll().stream().filter(role -> DataOwnership.visible(role.getCreatedBy()))
                .map(this::mapToRoleResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public RoleResponse getRoleByCode(String code) {
        Role role;
        try {
            UUID id = UUID.fromString(code);
            role = roleRepository.findById(id)
                    .or(() -> roleRepository.findByCode(code))
                    .orElseThrow(() -> new AppException("NOT_FOUND", "Role not found with identifier: " + code, HttpStatus.NOT_FOUND));
        } catch (IllegalArgumentException e) {
            role = roleRepository.findByCode(code)
                    .orElseThrow(() -> new AppException("NOT_FOUND", "Role not found with code: " + code, HttpStatus.NOT_FOUND));
        }
        DataOwnership.require(role.getCreatedBy());
        return mapToRoleResponse(role);
    }

    @Override
    @Transactional
    public RoleResponse createRole(RoleRequest request) {
        String code = request.getCode().trim().toUpperCase(Locale.ROOT);
        validateRoleCode(code);
        if (roleRepository.existsByCode(code)) {
            throw new AppException("CONFLICT", "Role code already exists: " + request.getCode(), HttpStatus.CONFLICT);
        }

        Set<Permission> permissions = resolvePermissions(request.getPermissionCodes());

        Role role = Role.builder()
                .code(code)
                .name(request.getName().trim())
                .description(request.getDescription())
                .isSystem(false)
                .createdBy(SecurityUtils.getCurrentUserEmail())
                .permissions(permissions)
                .build();

        Role saved = roleRepository.save(role);
        auditAfterCommit("ROLE_CREATE", "Created role " + saved.getCode());
        return mapToRoleResponse(saved);
    }

    @Override
    @Transactional
    public RoleResponse updateRole(UUID id, RoleRequest request) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new AppException("NOT_FOUND", "Role not found with ID: " + id, HttpStatus.NOT_FOUND));

        String code = request.getCode().trim().toUpperCase(Locale.ROOT);
        validateRoleCode(code);
        if (role.isSystem() && !role.getCode().equals(code)) {
            throw new AppException("FORBIDDEN", "System roles cannot have their code changed", HttpStatus.FORBIDDEN);
        }

        DataOwnership.require(role.getCreatedBy());
        requirePrivateRole(role);
        Set<Permission> permissions = resolvePermissions(request.getPermissionCodes());

        if (!role.getCode().equals(code) && roleRepository.existsByCode(code)) {
            throw new AppException("CONFLICT", "Mã vai trò đã tồn tại: " + code, HttpStatus.CONFLICT);
        }
        role.setCode(code);
        role.setName(request.getName().trim());
        role.setDescription(request.getDescription());
        if (DataOwnership.restricted()) {
            role.getPermissions().stream().filter(permission -> !DataOwnership.visible(permission.getCreatedBy())).forEach(permissions::add);
        }
        role.setPermissions(permissions);

        Role saved = roleRepository.save(role);
        auditAfterCommit("ROLE_UPDATE", "Updated role " + saved.getCode());
        return mapToRoleResponse(saved);
    }

    @Override
    @Transactional
    public void deleteRole(UUID id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new AppException("NOT_FOUND", "Role not found with ID: " + id, HttpStatus.NOT_FOUND));

        DataOwnership.require(role.getCreatedBy());
        requirePrivateRole(role);
        if (role.isSystem()) {
            throw new AppException("FORBIDDEN", "System roles cannot be deleted", HttpStatus.FORBIDDEN);
        }

        if (userRepository.existsByRolesId(id)) {
            throw new AppException("ROLE_IN_USE", "Vai trò đang được gán cho tài khoản. Hãy đổi vai trò của các tài khoản trước khi xoá.", HttpStatus.CONFLICT);
        }
        roleRepository.delete(role);
        auditAfterCommit("ROLE_DELETE", "Deleted role " + role.getCode());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PermissionResponse> getAllPermissions() {
        return permissionRepository.findAll().stream().filter(permission -> DataOwnership.visible(permission.getCreatedBy()))
                .map(this::mapToPermissionResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, List<PermissionResponse>> getGroupedPermissions() {
        return permissionRepository.findAll().stream().filter(permission -> DataOwnership.visible(permission.getCreatedBy()))
                .map(this::mapToPermissionResponse)
                .collect(Collectors.groupingBy(
                        p -> p.getModule() != null ? p.getModule().toUpperCase() : "GENERAL"
                ));
    }

    @Override
    @Transactional
    public PermissionResponse createPermission(com.example.ecp_api.dto.request.PermissionRequest request) {
        String code = request.getCode().trim().toLowerCase(Locale.ROOT);
        if (!code.matches("[a-z][a-z0-9_]*:[a-z][a-z0-9_]*")) {
            throw new AppException("INVALID_PERMISSION_CODE", "Mã quyền phải có dạng module:action.", HttpStatus.BAD_REQUEST);
        }
        if (permissionRepository.existsByCode(code)) {
            throw new AppException("CONFLICT", "Permission code already exists: " + code, HttpStatus.CONFLICT);
        }

        Permission permission = Permission.builder()
                .createdBy(SecurityUtils.getCurrentUserEmail())
                .code(code)
                .name(request.getName().trim())
                .module(request.getModule().trim().toUpperCase())
                .description(request.getDescription())
                .build();

        Permission saved = permissionRepository.save(permission);
        auditAfterCommit("PERMISSION_CREATE", "Created permission " + saved.getCode());
        return mapToPermissionResponse(saved);
    }

    @Override
    @Transactional
    public PermissionResponse updatePermission(UUID id, com.example.ecp_api.dto.request.PermissionRequest request) {
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new AppException("NOT_FOUND", "Không tìm thấy quyền.", HttpStatus.NOT_FOUND));
        DataOwnership.require(permission.getCreatedBy());
        String code = request.getCode().trim().toLowerCase(Locale.ROOT);
        if (!permission.getCode().equals(code)) {
            throw new AppException("PERMISSION_CODE_IMMUTABLE", "Mã quyền không được thay đổi sau khi tạo.", HttpStatus.BAD_REQUEST);
        }
        requirePrivatePermission(permission);
        permission.setName(request.getName().trim());
        permission.setModule(request.getModule().trim().toUpperCase(Locale.ROOT));
        permission.setDescription(request.getDescription());
        Permission saved = permissionRepository.save(permission);
        auditAfterCommit("PERMISSION_UPDATE", "Updated permission " + saved.getCode());
        return mapToPermissionResponse(saved);
    }

    @Override
    @Transactional
    public void deletePermission(UUID id) {
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new AppException("NOT_FOUND", "Không tìm thấy quyền.", HttpStatus.NOT_FOUND));
        DataOwnership.require(permission.getCreatedBy());
        if (permission.getCreatedBy() == null) {
            throw new AppException("SYSTEM_PERMISSION", "Không được xoá quyền hệ thống.", HttpStatus.FORBIDDEN);
        }
        if (roleRepository.existsByPermissionsId(id)) {
            throw new AppException("PERMISSION_IN_USE", "Quyền đang được gán cho vai trò. Hãy gỡ quyền khỏi vai trò trước khi xoá.", HttpStatus.CONFLICT);
        }
        permissionRepository.delete(permission);
        auditAfterCommit("PERMISSION_DELETE", "Deleted permission " + permission.getCode());
    }

    private boolean permissionWithinScope(Permission permission) {
        return !DataOwnership.restricted() || roleRepository.findByPermissionsId(permission.getId()).stream()
                .allMatch(role -> DataOwnership.visible(role.getCreatedBy()) && roleWithinScope(role));
    }

    private void requirePrivatePermission(Permission permission) {
        if (!permissionWithinScope(permission)) {
            throw new AppException("ROLE_SHARED", "Quyền đang được sử dụng ngoài phạm vi của bạn. Chỉ Super Admin được chỉnh sửa.", HttpStatus.FORBIDDEN);
        }
    }

    private void auditAfterCommit(String action, String details) {
        String actor = SecurityUtils.getCurrentUserEmail();
        Runnable write = () -> {
            try { auditLogService.log(action, actor, details); }
            catch (Exception error) { log.error("Could not record access change audit: {}", error.getMessage()); }
        };
        if (org.springframework.transaction.support.TransactionSynchronizationManager.isSynchronizationActive()) {
            org.springframework.transaction.support.TransactionSynchronizationManager.registerSynchronization(
                    new org.springframework.transaction.support.TransactionSynchronization() {
                        @Override public void afterCommit() { write.run(); }
                    });
        } else { write.run(); }
    }

    private Set<Permission> resolvePermissions(Set<String> codes) {
        if (codes == null || codes.isEmpty()) {
            return new HashSet<>();
        }
        Set<Permission> permissions = permissionRepository.findByCodeIn(codes);
        permissions.forEach(permission -> DataOwnership.require(permission.getCreatedBy()));
        Set<String> foundCodes = permissions.stream().map(Permission::getCode).collect(Collectors.toSet());
        if (!foundCodes.containsAll(codes)) {
            throw new AppException("ROLE_PERMISSION_INVALID", "Có quyền hạn không còn tồn tại. Vui lòng tải lại danh sách quyền", HttpStatus.BAD_REQUEST);
        }
        return permissions;
    }

    private boolean roleWithinScope(Role role) {
        return !DataOwnership.restricted() || userRepository.findAll((root, query, cb) -> cb.equal(root.join("roles").get("id"), role.getId())).stream()
                .allMatch(user -> user.getEmail().equalsIgnoreCase(SecurityUtils.getCurrentUserEmail())
                        || user.getCreatedBy() != null && DataOwnership.visible(user.getCreatedBy().getEmail()));
    }

    private void requirePrivateRole(Role role) {
        if (!roleWithinScope(role)) {
            throw new AppException("ROLE_SHARED", "Vai trò đang được sử dụng bởi tài khoản ngoài phạm vi của bạn. Chỉ Super Admin được sửa hoặc xoá.", HttpStatus.FORBIDDEN);
        }
    }

    private void validateRoleCode(String code) {
        if (DataOwnership.restricted() && (Set.of("SUPER_ADMIN", "ADMIN", "MANAGER", "USER").contains(code) || code.startsWith("ROLE_"))) {
            throw new AppException("FORBIDDEN", "Manager không được tạo hoặc sửa vai trò hệ thống.", HttpStatus.FORBIDDEN);
        }
    }

    private RoleResponse mapToRoleResponse(Role role) {
        Set<PermissionResponse> permissionResponses = role.getPermissions().stream().filter(permission -> DataOwnership.visible(permission.getCreatedBy()))
                .map(this::mapToPermissionResponse)
                .collect(Collectors.toSet());

        return RoleResponse.builder()
                .id(role.getId())
                .createdBy(role.getCreatedBy())
                .updatedBy(role.getUpdatedBy())
                .code(role.getCode())
                .name(role.getName())
                .description(role.getDescription())
                .isSystem(role.isSystem())
                .editable(!DataOwnership.restricted() || !role.isSystem() && roleWithinScope(role))
                .deletable(!role.isSystem() && !userRepository.existsByRolesId(role.getId()))
                .permissions(permissionResponses)
                .build();
    }

    private PermissionResponse mapToPermissionResponse(Permission permission) {
        return PermissionResponse.builder()
                .id(permission.getId())
                .createdBy(permission.getCreatedBy())
                .updatedBy(permission.getUpdatedBy())
                .system(permission.getCreatedBy() == null)
                .editable(permissionWithinScope(permission))
                .deletable(permission.getCreatedBy() != null && !roleRepository.existsByPermissionsId(permission.getId()))
                .code(permission.getCode())
                .name(permission.getName())
                .module(permission.getModule())
                .description(permission.getDescription())
                .build();
    }
}
