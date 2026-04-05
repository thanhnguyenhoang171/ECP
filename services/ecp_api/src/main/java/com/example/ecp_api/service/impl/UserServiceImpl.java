package com.example.ecp_api.service.impl;

import com.example.ecp_api.dto.request.UserRequest;
import com.example.ecp_api.dto.response.UserResponse;
import com.example.ecp_api.entity.User;
import com.example.ecp_api.mapper.UserMapper;
import com.example.ecp_api.repository.UserRepository;
import com.example.ecp_api.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    @Override
    public UserResponse registerUser(UserRequest userRequest) {
        // Checking existed email/username
        if (userRepository.existsByUsername(userRequest.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(userRequest.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Dùng MapStruct để chuyển DTO sang Entity
        User user = userMapper.toEntity(userRequest);
        
        // Mã hóa mật khẩu sau khi mapping
        user.setPassword(passwordEncoder.encode(userRequest.getPassword()));

        User savedUser = userRepository.save(user);

        // Dùng MapStruct để chuyển Entity sang Response
        return userMapper.toResponse(savedUser);
    }

    @Override
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return userMapper.toResponse(user);
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
    }
}
