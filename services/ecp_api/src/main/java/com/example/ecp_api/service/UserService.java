package com.example.ecp_api.service;

import com.example.ecp_api.dto.request.UserFilterRequest;
import com.example.ecp_api.dto.request.UserRequest;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.UserResponse;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface UserService {
    UserResponse registerUserByUsername(UserRequest userRequest);
    UserResponse getUserById(UUID id);
    PageResponse<UserResponse> getAllUsers(Pageable pageable);
    PageResponse<UserResponse> searchUsers(UserFilterRequest filter, Pageable pageable);
}
