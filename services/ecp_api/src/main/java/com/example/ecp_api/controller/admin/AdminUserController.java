package com.example.ecp_api.controller.admin;

import com.example.ecp_api.dto.request.UserFilterRequest;
import com.example.ecp_api.dto.request.UserRequest;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/v1/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN')")
@Tag(name = "[ADMIN] User Management", description = "Super Admin: Full CRUD on users of any role. Includes statistics and filtering.")
public class AdminUserController {

    private final UserService userService;

    @PostMapping
    @Operation(summary = "Create a new user (any role)")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@Valid @RequestBody UserRequest request) {
        return new ResponseEntity<>(ApiResponse.<UserResponse>builder()
                .success(true).message("User created successfully")
                .data(userService.createUser(request)).build(), HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Search and filter all users")
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

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a user by ID")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable UUID id) {
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
