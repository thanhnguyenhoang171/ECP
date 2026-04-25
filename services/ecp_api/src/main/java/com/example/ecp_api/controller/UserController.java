package com.example.ecp_api.controller;

import com.example.ecp_api.dto.request.UserRequest;
import com.example.ecp_api.dto.response.ApiResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.UserResponse;
import com.example.ecp_api.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody UserRequest userRequest) {
        UserResponse response = userService.registerUserByUsername(userRequest);
        ApiResponse<UserResponse> apiResponse = ApiResponse.<UserResponse>builder()
                .success(true)
                .message("User registered successfully")
                .data(response)
                .build();
        return new ResponseEntity<>(apiResponse, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
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
    public ResponseEntity<PageResponse<UserResponse>> getAllUsers(Pageable pageable) {
        return ResponseEntity.ok(userService.getAllUsers(pageable));
    }
}
