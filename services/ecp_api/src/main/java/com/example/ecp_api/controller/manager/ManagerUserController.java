package com.example.ecp_api.controller.manager;

import com.example.ecp_api.dto.request.UserFilterRequest;
import com.example.ecp_api.dto.request.UserRequest;
import com.example.ecp_api.dto.request.UserUpdateRequest;
import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.UserResponse;
import com.example.ecp_api.enums.users.UserRole;
import com.example.ecp_api.exception.AppException;
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

import com.example.ecp_api.dto.response.UserStatisticsResponse;

@RestController
@RequestMapping("/v1/manager/users")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('MANAGER', 'SUPER_ADMIN')")
@Tag(name = "[MANAGER] User Management", description = "Manager: CRUD on users with role USER or MANAGER. Cannot view, update, or delete SUPER_ADMIN accounts.")
public class ManagerUserController {

    private final UserService userService;

    @PostMapping
    @Operation(summary = "Create a new user account (MANAGER can only create MANAGER or USER roles)")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@Valid @RequestBody UserRequest request) {
        if (request.getRole() == UserRole.SUPER_ADMIN) {
            throw new AppException("FORBIDDEN", "Tài khoản Quản lý (Manager) không có quyền tạo tài khoản Quản trị viên cao cấp (Super Admin).", HttpStatus.FORBIDDEN);
        }
        UserResponse response = userService.createUser(request);
        return new ResponseEntity<>(ApiResponse.<UserResponse>builder()
                .success(true).message("User created successfully").data(response).build(), HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Search users (role USER and MANAGER only)")
    @Parameters({
            @Parameter(name = "page", example = "1", schema = @Schema(type = "integer", defaultValue = "1")),
            @Parameter(name = "size", example = "20", schema = @Schema(type = "integer", defaultValue = "20")),
            @Parameter(name = "sort", example = "createdAt,desc")
    })
    public ResponseEntity<PageResponse<UserResponse>> searchUsers(
            UserFilterRequest filter,
            @Parameter(hidden = true) @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        if (filter.getRole() == UserRole.SUPER_ADMIN) {
            throw new AppException("FORBIDDEN", "Managers are not allowed to access SUPER_ADMIN details.", HttpStatus.FORBIDDEN);
        }
        PageResponse<UserResponse> pageResponse = userService.searchUsers(filter, pageable);
        if (pageResponse.getData() != null) {
            pageResponse.getData().removeIf(u -> u.getRole() == UserRole.SUPER_ADMIN);
        }
        return ResponseEntity.ok(pageResponse);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user details by ID (USER or MANAGER role only)")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable UUID id) {
        UserResponse user = userService.getUserById(id);
        if (user.getRole() == UserRole.SUPER_ADMIN) {
            throw new AppException("FORBIDDEN", "Managers are not allowed to access SUPER_ADMIN details.", HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .success(true).message("User fetched successfully").data(user).build());
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Update user profile (JSON)")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserJson(
            @PathVariable UUID id, @Valid @RequestBody UserUpdateRequest request) {
        UserResponse user = userService.getUserById(id);
        if (user.getRole() == UserRole.SUPER_ADMIN) {
            throw new AppException("FORBIDDEN", "Managers are not allowed to modify SUPER_ADMIN accounts.", HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .success(true).message("User updated successfully")
                .data(userService.updateUser(id, request, null)).build());
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Update user profile (Multipart)")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserMultipart(
            @PathVariable UUID id,
            @RequestPart("user") @Valid UserUpdateRequest request,
            @RequestPart(value = "avatarFile", required = false) MultipartFile avatarFile) {
        UserResponse user = userService.getUserById(id);
        if (user.getRole() == UserRole.SUPER_ADMIN) {
            throw new AppException("FORBIDDEN", "Managers are not allowed to modify SUPER_ADMIN accounts.", HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .success(true).message("User updated successfully")
                .data(userService.updateUser(id, request, avatarFile)).build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete user (USER or MANAGER role only)")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable UUID id) {
        UserResponse user = userService.getUserById(id);
        if (user.getRole() == UserRole.SUPER_ADMIN) {
            throw new AppException("FORBIDDEN", "Managers are not allowed to delete SUPER_ADMIN accounts.", HttpStatus.FORBIDDEN);
        }
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true).message("User deleted successfully").build());
    }

    @GetMapping("/statistics")
    @Operation(summary = "Get user statistics (total, active, by role, etc.)")
    public ResponseEntity<ApiResponse<UserStatisticsResponse>> getStatistics() {
        return ResponseEntity.ok(ApiResponse.<UserStatisticsResponse>builder()
                .success(true).message("Statistics fetched successfully")
                .data(userService.getStatistics()).build());
    }
}
