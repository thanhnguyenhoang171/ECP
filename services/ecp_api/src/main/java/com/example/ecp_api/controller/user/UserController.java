package com.example.ecp_api.controller.user;

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
@RequestMapping("/v1/users")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('user:read') or hasRole('SUPER_ADMIN')")
@Tag(name = "Users", description = "User Management APIs: Account management, role assignment, status checks, and statistics.")
public class UserController {

    private final UserService userService;
    private final TokenService tokenService;

    @PostMapping
    @PreAuthorize("(hasAuthority('user:create') or hasRole('SUPER_ADMIN')) and @userSecurityEvaluator.canAssignRoles(authentication, #request.roles)")
    @Operation(summary = "Create a new user account")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@Valid @RequestBody UserRequest request) {
        return new ResponseEntity<>(ApiResponse.<UserResponse>builder()
                .success(true)
                .code("USER_CREATED_SUCCESS")
                .message("User created successfully")
                .data(userService.createUser(request))
                .build(), HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Search users with filter parameters")
    public ResponseEntity<PageResponse<UserResponse>> getAllUsers(
            UserFilterRequest request,
            @Parameter(hidden = true) @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(userService.searchUsers(request, pageable));
    }

    @GetMapping("/statistics")
    @Operation(summary = "Get user account statistics")
    public ResponseEntity<ApiResponse<UserStatisticsResponse>> getStatistics() {
        return ResponseEntity.ok(ApiResponse.<UserStatisticsResponse>builder()
                .success(true)
                .code("USER_STATISTICS_FETCHED_SUCCESS")
                .message("User statistics fetched successfully")
                .data(userService.getStatistics())
                .build());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user details by ID")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .success(true)
                .code("USER_FETCHED_SUCCESS")
                .message("User fetched successfully")
                .data(userService.getUserById(id))
                .build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('user:update') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Update user details by ID")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable UUID id,
            @Valid @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .success(true)
                .code("USER_UPDATED_SUCCESS")
                .message("User updated successfully")
                .data(userService.updateUser(id, request))
                .build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('user:delete') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Delete user account")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable UUID id) {
        UserResponse user = userService.getUserById(id);
        userService.deleteUser(id);
        tokenService.revokeUserTokens(user.getEmail());
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .code("USER_DELETED_SUCCESS")
                .message("User deleted successfully")
                .build());
    }
}
