package com.example.ecp_api.service;

import com.example.ecp_api.dto.request.UserRequest;
import com.example.ecp_api.dto.response.UserResponse;

import java.util.List;
import java.util.UUID;

public interface UserService {
    UserResponse registerUserByUsername(UserRequest userRequest);
    UserResponse getUserById(UUID id);
    List<UserResponse> getAllUsers();
}
