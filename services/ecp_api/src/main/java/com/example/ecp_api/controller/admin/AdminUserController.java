package com.example.ecp_api.controller.admin;

import com.example.ecp_api.dto.request.UserFilterRequest;
import com.example.ecp_api.dto.request.UserRequest;
import com.example.ecp_api.dto.request.UserUpdateRequest;
import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.UserResponse;
import com.example.ecp_api.dto.response.UserStatisticsResponse;
import com.example.ecp_api.service.TokenService;
import com.example.ecp_api.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/v1/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('user:read') or hasRole('SUPER_ADMIN')")
@Tag(name = "[ADMIN] User Management", description = "Management API: User account management, role assignment, status checks, and statistics.")
public class AdminUserController {

    private final UserService userService;
    private final TokenService tokenService;

    @PostMapping
    @PreAuthorize("(hasAuthority('user:create') or hasRole('SUPER_ADMIN')) and @userSecurityEvaluator.canAssignRoles(authentication, #request.roles)")
    @Operation(summary = "Create a new user account")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@Valid @RequestBody UserRequest request) {
        return new ResponseEntity<>(ApiResponse.<UserResponse>builder()
                .success(true).message("User created successfully")
                .data(userService.createUser(request)).build(), HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Search and filter users")
    @Parameters({
            @Parameter(name = "page", example = "1", schema = @Schema(type = "integer", defaultValue = "1")),
            @Parameter(name = "size", example = "20", schema = @Schema(type = "integer", defaultValue = "20")),
            @Parameter(name = "sort", example = "createdAt,desc")
    })
    public ResponseEntity<PageResponse<UserResponse>> getAllUsers(
            UserFilterRequest filter,
            @Parameter(hidden = true) @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(userService.searchUsers(filter, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .success(true).message("User fetched successfully")
                .data(userService.getUserById(id)).build());
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("(hasAuthority('user:update') or hasRole('SUPER_ADMIN')) and @userSecurityEvaluator.canManageUser(authentication, #id) and @userSecurityEvaluator.canAssignRoles(authentication, #request.roles)")
    @Operation(summary = "Update user profile (JSON)")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserJson(
            @PathVariable UUID id, @Valid @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .success(true).message("User updated successfully")
                .data(userService.updateUser(id, request, null)).build());
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("(hasAuthority('user:update') or hasRole('SUPER_ADMIN')) and @userSecurityEvaluator.canManageUser(authentication, #id) and @userSecurityEvaluator.canAssignRoles(authentication, #request.roles)")
    @Operation(summary = "Update user profile (Multipart)")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserMultipart(
            @PathVariable UUID id,
            @RequestPart("user") @Valid UserUpdateRequest request,
            @RequestPart(value = "avatarFile", required = false) MultipartFile avatarFile) {
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .success(true).message("User updated successfully")
                .data(userService.updateUser(id, request, avatarFile)).build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("(hasAuthority('user:delete') or hasRole('SUPER_ADMIN')) and @userSecurityEvaluator.canManageUser(authentication, #id)")
    @Operation(summary = "Delete a user by ID")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true).message("User deleted successfully").build());
    }

    @GetMapping("/statistics")
    @Operation(summary = "Get user statistics")
    public ResponseEntity<ApiResponse<UserStatisticsResponse>> getStatistics() {
        return ResponseEntity.ok(ApiResponse.<UserStatisticsResponse>builder()
                .success(true).message("Statistics fetched successfully")
                .data(userService.getStatistics()).build());
    }

    @GetMapping("/status/{id}")
    @Operation(summary = "Check user online status by User ID")
    public ResponseEntity<ApiResponse<Boolean>> checkUserStatus(@PathVariable String id) {
        UserResponse user = userService.getUserById(UUID.fromString(id));
        boolean isOnline = tokenService.isUserOnline(user.getEmail());
        return ResponseEntity.ok(ApiResponse.<Boolean>builder()
                .success(true)
                .message("User status fetched successfully")
                .data(isOnline)
                .build());
    }
}
