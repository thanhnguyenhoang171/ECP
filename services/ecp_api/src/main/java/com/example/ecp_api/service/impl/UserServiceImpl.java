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

import com.example.ecp_api.dto.request.GoogleLoginRequest;
import com.example.ecp_api.entity.jpa.UserProfile;
import com.example.ecp_api.enums.users.MembershipTier;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final AuditLogService auditLogService;
    private final TokenService tokenService;

    @Value("${google.client-id:}")
    private String googleClientId;

    @Override
    @Transactional
    public UserResponse registerUserByEmail(UserRequest userRequest) {
        String normalizedEmail = userRequest.getEmail().toLowerCase().trim();

        // Checking existed email
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new AppException("USER_ALREADY_EXISTS", "Email already registered", HttpStatus.BAD_REQUEST);
        }

        // Map DTO to Entity
        User user = userMapper.toEntity(userRequest);
        user.setEmail(normalizedEmail);

        // Thiết lập thuộc tính từ request hoặc mặc định
        user.setPasswordHash(passwordEncoder.encode(userRequest.getPassword()));
        user.setProvider(AuthProvider.LOCAL);
        user.setRole(userRequest.getRole() != null ? userRequest.getRole() : UserRole.USER);
        user.setActive(userRequest.getActive() != null ? userRequest.getActive() : true);

        if (user.getProfile() == null) {
            user.setProfile(new UserProfile());
        }
        user.getProfile().setUser(user);

        if (StringUtils.hasText(userRequest.getAvatarUrl())) {
            user.getProfile().setAvatarUrl(userRequest.getAvatarUrl());
        }
        if (StringUtils.hasText(userRequest.getAvatarPublicId())) {
            user.getProfile().setAvatarPublicId(userRequest.getAvatarPublicId());
        }
        if (StringUtils.hasText(userRequest.getFirstName())) {
            user.getProfile().setFirstName(userRequest.getFirstName());
        }
        if (StringUtils.hasText(userRequest.getLastName())) {
            user.getProfile().setLastName(userRequest.getLastName());
        }
        if (StringUtils.hasText(userRequest.getPhoneNumber())) {
            user.getProfile().setPhoneNumber(userRequest.getPhoneNumber());
        }

        // Gán createdBy và updatedBy nếu có người dùng đang thao tác
        String operatorEmail = SecurityUtils.getCurrentUserEmail();
        if (StringUtils.hasText(operatorEmail) && !"SYSTEM".equals(operatorEmail)) {
            User operator = userRepository.findByEmail(operatorEmail).orElse(null);
            if (operator != null) {
                user.setCreatedBy(operator);
                user.setUpdatedBy(operator);
            }
        }

        // Lưu user (cascade save profile)
        user = userRepository.save(user);

        // Ghi log hoạt động kiểm toán (Audit Log)
        auditLogService.log(
            "USER_CREATE",
            operatorEmail,
            String.format("Tạo mới tài khoản user: %s (ID: %s, Role: %s)", user.getEmail(), user.getId(), user.getRole())
        );

        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse processGoogleLogin(GoogleLoginRequest googleLoginRequest) {
        String tokeninfoUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" + googleLoginRequest.getIdToken();
        RestTemplate restTemplate = new RestTemplate();

        Map<String, Object> payload;
        try {
            payload = restTemplate.getForObject(tokeninfoUrl, Map.class);
        } catch (Exception e) {
            log.error("Google Token verification error: ", e);
            throw new AppException("INVALID_GOOGLE_TOKEN", "Google authentication failed", HttpStatus.BAD_REQUEST);
        }

        if (payload == null || payload.get("email") == null) {
            throw new AppException("INVALID_GOOGLE_TOKEN", "Unable to extract email from Google token", HttpStatus.BAD_REQUEST);
        }

        // Validate Audience (Client ID) if configured
        if (StringUtils.hasText(googleClientId)) {
            String aud = (String) payload.get("aud");
            if (aud != null && !googleClientId.equals(aud)) {
                log.warn("Google token audience mismatch. Expected: {}, Found: {}", googleClientId, aud);
            }
        }

        String email = ((String) payload.get("email")).toLowerCase().trim();
        String googleId = (String) payload.get("sub");
        String givenName = (String) payload.getOrDefault("given_name", "");
        String familyName = (String) payload.getOrDefault("family_name", "");
        String fullName = (String) payload.getOrDefault("name", "");
        String picture = (String) payload.getOrDefault("picture", "");

        String firstName = StringUtils.hasText(givenName) ? givenName : fullName;
        String lastName = familyName;

        User user = userRepository.findByEmail(email).map(existingUser -> {
            log.info("Account linking for Google login on existing email: {}", email);
            if (!StringUtils.hasText(existingUser.getProviderId())) {
                existingUser.setProviderId(googleId);
            }
            if (!existingUser.isEmailVerified()) {
                existingUser.setEmailVerified(true);
            }

            // Update or create profile information
            UserProfile profile = existingUser.getProfile();
            if (profile == null) {
                profile = UserProfile.builder()
                        .user(existingUser)
                        .firstName(firstName)
                        .lastName(lastName)
                        .avatarUrl(picture)
                        .membershipTier(MembershipTier.MEMBER)
                        .build();
                existingUser.setProfile(profile);
            } else {
                if (!StringUtils.hasText(profile.getFirstName())) {
                    profile.setFirstName(firstName);
                }
                if (!StringUtils.hasText(profile.getLastName())) {
                    profile.setLastName(lastName);
                }
                // Chỉ set avatarUrl từ Google nếu user CHƯA THIẾT LẬP avatar tùy chỉnh (Cloudinary...)
                if (!StringUtils.hasText(profile.getAvatarUrl()) && StringUtils.hasText(picture)) {
                    profile.setAvatarUrl(picture);
                }
            }

            return userRepository.save(existingUser);
        }).orElseGet(() -> {
            log.info("Creating new user from Google Login: {}", email);
            User newUser = User.builder()
                    .email(email)
                    .provider(AuthProvider.GOOGLE)
                    .providerId(googleId)
                    .role(UserRole.USER)
                    .active(true)
                    .emailVerified(true)
                    .build();

            UserProfile profile = UserProfile.builder()
                    .user(newUser)
                    .firstName(firstName)
                    .lastName(lastName)
                    .avatarUrl(picture)
                    .membershipTier(MembershipTier.MEMBER)
                    .build();

            newUser.setProfile(profile);
            return userRepository.save(newUser);
        });

        auditLogService.log("GOOGLE_LOGIN", email, "User logged in with Google ID: " + user.getId());
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
                        cb.like(cb.lower(root.get("email")), searchPattern),
                        cb.like(cb.lower(root.join("profile").get("phoneNumber")), searchPattern),
                        cb.like(cb.lower(root.join("profile").get("firstName")), searchPattern),
                        cb.like(cb.lower(root.join("profile").get("lastName")), searchPattern)
                );
                predicates.add(keywordPredicate);
            }
            if (StringUtils.hasText(filter.getEmail())) {
                predicates.add(cb.like(cb.lower(root.get("email")),
                        "%" + filter.getEmail().toLowerCase() + "%"));
            }
            if (filter.getRoles() != null && !filter.getRoles().isEmpty()) {
                predicates.add(root.get("role").in(filter.getRoles()));
            } else if (filter.getRole() != null) {
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

        UserRole oldRole = user.getRole();
        boolean oldActive = user.isActive();

        // Khởi tạo sẵn profile nếu null trước khi Mapper cập nhật
        if (user.getProfile() == null) {
            user.setProfile(UserProfile.builder().user(user).build());
        }

        userMapper.updateUserFromRequest(request, user);

        if (user.getProfile() != null && user.getProfile().getUser() == null) {
            user.getProfile().setUser(user);
        }

        String operatorEmail = SecurityUtils.getCurrentUserEmail();
        if (StringUtils.hasText(operatorEmail) && !"SYSTEM".equals(operatorEmail)) {
            User operator = userRepository.findByEmail(operatorEmail).orElse(null);
            if (operator != null) {
                user.setUpdatedBy(operator);
            }
        }

        user = userRepository.save(user);

        // Chỉ thu hồi token khi vai trò THỰC SỰ bị thay đổi HOẶC tài khoản bị khóa (active -> false)
        boolean roleChanged = oldRole != user.getRole();
        boolean deactivated = oldActive && !user.isActive();

        if (roleChanged || deactivated) {
            log.info("Revoking tokens for user {} (roleChanged={}, deactivated={})", user.getEmail(), roleChanged, deactivated);
            tokenService.revokeUserTokens(user.getEmail());
        }

        auditLogService.log("USER_UPDATE", operatorEmail, "Updated user with ID: " + user.getId());

        return userMapper.toResponse(user);
    }

    @Override
    public void deleteUser(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException("USER_NOT_FOUND", "User not found", HttpStatus.NOT_FOUND));

        String operatorEmail = SecurityUtils.getCurrentUserEmail();
        if (StringUtils.hasText(operatorEmail) && !"SYSTEM".equals(operatorEmail)) {
            User operator = userRepository.findByEmail(operatorEmail).orElse(null);
            if (operator != null) {
                user.setDeletedBy(operator);
            }
        }

        user.setActive(false);
        user.setDeletedAt(LocalDateTime.now());
        userRepository.save(user);

        tokenService.revokeUserTokens(user.getEmail());

        auditLogService.log("USER_DELETE", operatorEmail, "Soft deleted user with ID: " + user.getId());
    }

    @Override
    public UserResponse getCurrentUserAccount(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("USER_NOT_FOUND", "User not found", HttpStatus.NOT_FOUND));
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public void updateLastLogin(String email) {
        userRepository.findByEmail(email)
                .ifPresent(user -> {
                    user.setLastLoginAt(LocalDateTime.now());
                    userRepository.save(user);
                });
    }

    @Override
    public UserStatisticsResponse getStatistics() {
        long totalUsers = userRepository.count();
        long onlineUsers = tokenService.countOnlineUsers();
        long managementUsers = userRepository.countByRoleIn(List.of(UserRole.SUPER_ADMIN, UserRole.MANAGER));
        long customerUsers = userRepository.countByRoleIn(List.of(UserRole.USER));

        return UserStatisticsResponse.builder()
                .totalUsers(totalUsers)
                .onlineUsers(onlineUsers)
                .offlineUsers(Math.max(0, totalUsers - onlineUsers))
                .managementUsers(managementUsers)
                .customerUsers(customerUsers)
                .build();
    }
}
