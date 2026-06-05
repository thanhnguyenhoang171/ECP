package com.example.ecp_api.controller;

import com.example.ecp_api.dto.request.UserFilterRequest;
import com.example.ecp_api.dto.request.UserUpdateRequest;
import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.UserResponse;
import com.example.ecp_api.dto.response.UserStatisticsResponse;
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
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/v1/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "APIs for managing users and profiles")
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID", description = "Retrieve detailed information for a specific user.")
    public ResponseEntity<ApiResponse<UserResponse>> getUser(@PathVariable("id") UUID id) {
        UserResponse response = userService.getUserById(id);
        ApiResponse<UserResponse> apiResponse = ApiResponse.<UserResponse>builder()
                .success(true)
                .message("User fetched successfully")
                .data(response)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    @Operation(summary = "Search users", description = "Retrieve users with advanced filtering and pagination. Admin/Manager access required.")
    @Parameters({
            @Parameter(name = "page", description = "Page number (1-indexed)", example = "1", schema = @Schema(type = "integer", defaultValue = "1")),
            @Parameter(name = "size", description = "Number of items per page (max 100)", example = "20", schema = @Schema(type = "integer", defaultValue = "20", maximum = "100")),
            @Parameter(name = "sort", description = "Sorting criteria (e.g. username,asc)", example = "createdAt,desc")
    })
    public ResponseEntity<PageResponse<UserResponse>> getAllUsers(
            @Valid UserFilterRequest filter,
            @Parameter(hidden = true) @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(userService.searchUsers(filter, pageable));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update user profile", description = "Updates user profile information. Password updates should be handled separately.")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable("id") UUID id,
            @Valid @RequestBody UserUpdateRequest request) {
        UserResponse response = userService.updateUser(id, request);
        ApiResponse<UserResponse> apiResponse = ApiResponse.<UserResponse>builder()
                .success(true)
                .message("User updated successfully")
                .data(response)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Delete user", description = "Soft deletes a user account. Super Admin access required.")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable("id") UUID id) {
        userService.deleteUser(id);
        ApiResponse<Void> apiResponse = ApiResponse.<Void>builder()
                .success(true)
                .message("User deleted successfully")
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    @Operation(summary = "Get user statistics", description = "Retrieve total users, online/offline counts, and management users (Admin/Manager). Admin/Manager access required.")
    public ResponseEntity<ApiResponse<UserStatisticsResponse>> getUserStatistics() {
        return ResponseEntity.ok(
                ApiResponse.<UserStatisticsResponse>builder()
                        .success(true)
                        .message("User statistics fetched successfully")
                        .data(userService.getStatistics())
                        .build()
        );
    }
}
