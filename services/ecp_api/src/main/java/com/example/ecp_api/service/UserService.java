package com.example.ecp_api.service;

import com.example.ecp_api.dto.request.UserRequest;
import com.example.ecp_api.dto.response.UserResponse;

import java.util.List;

public interface UserService {
    UserResponse registerUser(UserRequest userRequest);
    UserResponse getUserById(Long id);
    List<UserResponse> getAllUsers();
}
