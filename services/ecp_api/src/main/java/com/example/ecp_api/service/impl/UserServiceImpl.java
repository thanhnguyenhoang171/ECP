package com.example.ecp_api.service.impl;

import com.example.ecp_api.dto.request.UserRequest;
import com.example.ecp_api.dto.response.UserResponse;
import com.example.ecp_api.entity.User;
import com.example.ecp_api.enums.users.AuthProvider;
import com.example.ecp_api.enums.users.UserRole;
import com.example.ecp_api.exception.AppException;
import com.example.ecp_api.mapper.UserMapper;
import com.example.ecp_api.repository.jpa.UserRepository;
import com.example.ecp_api.service.AuditLogService;
import com.example.ecp_api.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final AuditLogService auditLogService;

    @Override
    public UserResponse registerUserByUsername(UserRequest userRequest) {
        // Checking existed email
        if (userRepository.existsByUsername(userRequest.getUsername())) {
            throw new AppException("Username already exists", HttpStatus.BAD_REQUEST);
        }

        // Map DTO to Entity
        User user = userMapper.toEntity(userRequest);

        // Thiết lập các thuộc tính mặc định
        user.setPasswordHash(passwordEncoder.encode(userRequest.getPassword()));
        user.setProvider(AuthProvider.LOCAL);
        user.setRole(UserRole.CUSTOMER);
        user.setActive(true);

        if (user.getProfile() != null) {
            user.getProfile().setUser(user);
        }

        // Lưu user (cascade save profile)
        user = userRepository.save(user);

        // Ghi log hoạt động vào MongoDB
        auditLogService.log("USER_REGISTER", user.getUsername(), "New user registered with ID: " + user.getId());

        return userMapper.toResponse(user);
    }

    @Override
    public UserResponse getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
        
        // Ghi log vào MongoDB mỗi khi truy vấn User
        auditLogService.log("GET_USER", user.getUsername(), "Fetched user with ID: " + id);
        
        return userMapper.toResponse(user);
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
    }
}
