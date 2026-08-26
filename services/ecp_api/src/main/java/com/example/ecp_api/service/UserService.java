package com.example.ecp_api.service;

import com.example.ecp_api.dto.request.*;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.UserResponse;
import com.example.ecp_api.dto.response.UserStatisticsResponse;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface UserService {
    UserResponse registerUserByEmail(RegisterRequest registerRequest);
    UserResponse createUser(UserRequest userRequest);

    UserResponse processGoogleLogin(GoogleLoginRequest googleLoginRequest);
    UserResponse getUserById(UUID id);
    PageResponse<UserResponse> getAllUsers(Pageable pageable);
    PageResponse<UserResponse> searchUsers(UserFilterRequest filter, Pageable pageable);
    UserResponse updateUser(UUID id, UserUpdateRequest request);
    UserResponse updateUser(UUID id, UserUpdateRequest request, org.springframework.web.multipart.MultipartFile avatarFile);
    void deleteUser(UUID id);
    
    // Auth helpers
    UserResponse getCurrentUserAccount(String email);
    UserResponse updateCurrentUserAccount(String email, UpdateMyAccountRequest request);
    UserResponse updateCurrentUserAvatar(String email, org.springframework.web.multipart.MultipartFile file);
    UserResponse deleteCurrentUserAvatar(String email);
    void updateLastLogin(String identifier);
    UserStatisticsResponse getStatistics();
}
