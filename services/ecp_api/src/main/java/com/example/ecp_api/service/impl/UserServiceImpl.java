package com.example.ecp_api.service.impl;

import com.example.ecp_api.dto.request.UserFilterRequest;
import com.example.ecp_api.dto.request.UserRequest;
import com.example.ecp_api.dto.request.UserUpdateRequest;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.UserResponse;
import com.example.ecp_api.dto.response.UserStatisticsResponse;
import com.example.ecp_api.entity.jpa.User;
import com.example.ecp_api.enums.users.AuthProvider;
import com.example.ecp_api.enums.users.UserRole;
import com.example.ecp_api.exception.AppException;
import com.example.ecp_api.mapper.UserMapper;
import com.example.ecp_api.repository.jpa.UserRepository;
import com.example.ecp_api.service.AuditLogService;
import com.example.ecp_api.service.TokenService;
import com.example.ecp_api.service.UserService;
import com.example.ecp_api.util.PaginationUtils;
import com.example.ecp_api.util.SecurityUtils;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final AuditLogService auditLogService;
    private final TokenService tokenService;

    @Override
    public UserResponse registerUserByUsername(UserRequest userRequest) {
        // Checking existed email
        if (userRepository.existsByUsername(userRequest.getUsername())) {
            throw new AppException("USER_ALREADY_EXISTS", "Username already exists", HttpStatus.BAD_REQUEST);
        }

        // Map DTO to Entity
        User user = userMapper.toEntity(userRequest);

        // Thiết lập các thuộc tính mặc định
        user.setPasswordHash(passwordEncoder.encode(userRequest.getPassword()));
        user.setProvider(AuthProvider.LOCAL);
        user.setRole(UserRole.USER);
        user.setActive(true);

        if (user.getProfile() != null) {
            user.getProfile().setUser(user);
        }

        // Lưu user (cascade save profile)
        user = userRepository.save(user);

        // Ghi log hoạt động vào MongoDB
        auditLogService.log("USER_REGISTER", SecurityUtils.getCurrentUsername(), "New user registered with ID: " + user.getId());

        return userMapper.toResponse(user);
    }

    @Override
    public UserResponse getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException("USER_NOT_FOUND", "User not found", HttpStatus.NOT_FOUND));
        
        return userMapper.toResponse(user);
    }

    @Override
    public PageResponse<UserResponse> getAllUsers(Pageable pageable) {
        Pageable finalPageable = PaginationUtils.applyStableSort(pageable, 
                Sort.Order.desc("createdAt"), 
                Sort.Order.asc("id"));
        return userMapper.toPageResponse(userRepository.findAll(finalPageable));
    }

    @Override
    public PageResponse<UserResponse> searchUsers(UserFilterRequest filter, Pageable pageable) {
        Pageable finalPageable = PaginationUtils.applyStableSort(pageable, 
                Sort.Order.desc("createdAt"), 
                Sort.Order.asc("id"));

        Specification<User> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(filter.getKeyword())) {
                String searchPattern = "%" + filter.getKeyword().toLowerCase() + "%";
                Predicate keywordPredicate = cb.or(
                        cb.like(cb.lower(root.get("username")), searchPattern),
                        cb.like(cb.lower(root.get("email")), searchPattern),
                        cb.like(cb.lower(root.get("phoneNumber")), searchPattern),
                        cb.like(cb.lower(root.join("profile").get("firstName")), searchPattern),
                        cb.like(cb.lower(root.join("profile").get("lastName")), searchPattern)
                );
                predicates.add(keywordPredicate);
            }

            if (StringUtils.hasText(filter.getUsername())) {
                predicates.add(cb.like(cb.lower(root.get("username")),
                        "%" + filter.getUsername().toLowerCase() + "%"));
            }
            if (StringUtils.hasText(filter.getEmail())) {
                predicates.add(cb.like(cb.lower(root.get("email")),
                        "%" + filter.getEmail().toLowerCase() + "%"));
            }
            if (filter.getRole() != null) {
                predicates.add(cb.equal(root.get("role"), filter.getRole()));
            }
            if (filter.getActive() != null) {
                predicates.add(cb.equal(root.get("active"), filter.getActive()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<User> userPage = userRepository.findAll(spec, finalPageable);
        return userMapper.toPageResponse(userPage);
    }

    @Override
    public UserResponse updateUser(UUID id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException("USER_NOT_FOUND", "User not found", HttpStatus.NOT_FOUND));

        userMapper.updateUserFromRequest(request, user);

        if (user.getProfile() != null && user.getProfile().getUser() == null) {
            user.getProfile().setUser(user);
        }

        user = userRepository.save(user);

        auditLogService.log("UPDATE_USER", SecurityUtils.getCurrentUsername(), "Updated user with ID: " + user.getId());

        return userMapper.toResponse(user);
    }

    @Override
    public void deleteUser(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException("USER_NOT_FOUND", "User not found", HttpStatus.NOT_FOUND));

        user.setActive(false);
        user.setDeletedAt(LocalDateTime.now());
        userRepository.save(user);

        auditLogService.log("DELETE_USER", SecurityUtils.getCurrentUsername(), "Soft deleted user with ID: " + user.getId());
    }

    @Override
    @Transactional
    public void updateLastLogin(String username) {
        userRepository.findByUsername(username).ifPresent(user -> {
            user.setLastLoginAt(LocalDateTime.now());
            userRepository.save(user);
        });
    }

    @Override
    public UserStatisticsResponse getStatistics() {
        long totalUsers = userRepository.count();
        long onlineUsers = tokenService.countOnlineUsers();
        long managementUsers = userRepository.countByRoleIn(List.of(UserRole.SUPER_ADMIN, UserRole.MANAGER));

        return UserStatisticsResponse.builder()
                .totalUsers(totalUsers)
                .onlineUsers(onlineUsers)
                .offlineUsers(Math.max(0, totalUsers - onlineUsers))
                .managementUsers(managementUsers)
                .build();
    }
}
