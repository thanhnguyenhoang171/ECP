package com.example.ecp_api.controller.user;

import com.example.ecp_api.dto.request.UserUpdateRequest;
import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.dto.response.UserResponse;
import com.example.ecp_api.service.UserService;
import com.example.ecp_api.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/users/me")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
@Tag(name = "Account", description = "Current Logged-in User Profile APIs")
public class AccountController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "Get current logged-in user account details")
    public ResponseEntity<ApiResponse<UserResponse>> getMyAccount() {
        String email = SecurityUtils.getCurrentUsername();
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .success(true)
                .code("ACCOUNT_FETCHED_SUCCESS")
                .message("Account fetched successfully")
                .data(userService.getCurrentUserAccount(email))
                .build());
    }

    @PutMapping
    @Operation(summary = "Update current logged-in user account details", 
               description = "Updates profile details for current logged-in user including phoneNumber, firstName, lastName, avatarUrl, avatarPublicId, dob, and gender.")
    public ResponseEntity<ApiResponse<UserResponse>> updateMyAccount(
            @Valid @RequestBody UserUpdateRequest request) {
        String email = SecurityUtils.getCurrentUsername();
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .success(true)
                .code("ACCOUNT_UPDATED_SUCCESS")
                .message("Account updated successfully")
                .data(userService.updateCurrentUserAccount(email, request))
                .build());
    }
}
