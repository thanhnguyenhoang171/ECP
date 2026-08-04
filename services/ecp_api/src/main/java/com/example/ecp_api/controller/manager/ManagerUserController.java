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
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/v1/manager/users")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('MANAGER', 'SUPER_ADMIN')")
@Tag(name = "[MANAGER] User Management", description = "Manager: CRUD on users with role USER or MANAGER. Cannot view, update, or delete SUPER_ADMIN accounts.")
public class ManagerUserController {

    private final UserService userService;

    @PostMapping
    @Operation(summary = "Create a new user account (creates USER role by default)")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@Valid @RequestBody UserRequest request) {
        UserResponse response = userService.registerUserByEmail(request);
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

    @PutMapping("/{id}")
    @Operation(summary = "Update user profile (USER or MANAGER role only)")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable UUID id, @RequestBody UserUpdateRequest request) {
        UserResponse user = userService.getUserById(id);
        if (user.getRole() == UserRole.SUPER_ADMIN) {
            throw new AppException("FORBIDDEN", "Managers are not allowed to modify SUPER_ADMIN accounts.", HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .success(true).message("User updated successfully")
                .data(userService.updateUser(id, request)).build());
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
}
