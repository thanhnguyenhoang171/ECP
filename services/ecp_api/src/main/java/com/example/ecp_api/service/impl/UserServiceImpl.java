package com.example.ecp_api.service.impl;

import com.example.ecp_api.dto.request.GoogleLoginRequest;
import com.example.ecp_api.dto.request.RegisterRequest;
import com.example.ecp_api.dto.request.UserFilterRequest;
import com.example.ecp_api.dto.request.UserRequest;
import com.example.ecp_api.dto.request.UserUpdateRequest;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.dto.response.UserResponse;
import com.example.ecp_api.dto.response.UserStatisticsResponse;
import com.example.ecp_api.entity.jpa.Role;
import com.example.ecp_api.entity.jpa.User;
import com.example.ecp_api.entity.jpa.UserProfile;
import com.example.ecp_api.enums.users.AuthProvider;
import com.example.ecp_api.exception.AppException;
import com.example.ecp_api.mapper.UserMapper;
import com.example.ecp_api.repository.jpa.RoleRepository;
import com.example.ecp_api.repository.jpa.UserRepository;
import com.example.ecp_api.service.AuditLogService;
import com.example.ecp_api.service.CloudinaryService;
import com.example.ecp_api.service.TokenService;
import com.example.ecp_api.service.UserService;
import com.example.ecp_api.util.PaginationUtils;
import com.example.ecp_api.util.SecurityUtils;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final AuditLogService auditLogService;
    private final TokenService tokenService;
    private final CloudinaryService cloudinaryService;

    @Value("${google.client-id:}")
    private String googleClientId;

    @Override
    @Transactional
    public UserResponse registerUserByEmail(RegisterRequest registerRequest) {
        String normalizedEmail = registerRequest.getEmail().toLowerCase().trim();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new AppException("USER_ALREADY_EXISTS", "Email already registered", HttpStatus.BAD_REQUEST);
        }

        User user = userMapper.toEntity(registerRequest);
        user.setEmail(normalizedEmail);

        user.setPasswordHash(passwordEncoder.encode(registerRequest.getPassword()));
        user.setProvider(AuthProvider.LOCAL);
        user.setActive(true);

        Set<Role> roles = new HashSet<>();
        roleRepository.findByCode("USER").ifPresent(roles::add);
        user.setRoles(roles);

        if (user.getProfile() == null) {
            user.setProfile(new UserProfile());
        }
        user.getProfile().setUser(user);

        if (StringUtils.hasText(registerRequest.getFirstName())) {
            user.getProfile().setFirstName(registerRequest.getFirstName());
        }
        if (StringUtils.hasText(registerRequest.getLastName())) {
            user.getProfile().setLastName(registerRequest.getLastName());
        }

        String operatorEmail = SecurityUtils.getCurrentUserEmail();
        if (StringUtils.hasText(operatorEmail) && !"SYSTEM".equals(operatorEmail)) {
            User operator = userRepository.findByEmail(operatorEmail).orElse(null);
            if (operator != null) {
                user.setCreatedBy(operator);
                user.setUpdatedBy(operator);
            }
        }

        user = userRepository.save(user);

        auditLogService.log(
                "USER_CREATE",
                operatorEmail,
                String.format("Created user account: %s (ID: %s)", user.getEmail(), user.getId())
        );

        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse createUser(UserRequest userRequest) {
        String normalizedEmail = userRequest.getEmail().toLowerCase().trim();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new AppException("USER_ALREADY_EXISTS", "Email already registered", HttpStatus.BAD_REQUEST);
        }

        User user = userMapper.toEntity(userRequest);
        user.setEmail(normalizedEmail);

        user.setPasswordHash(passwordEncoder.encode(userRequest.getPassword()));
        user.setProvider(AuthProvider.LOCAL);
        user.setActive(userRequest.getActive() != null ? userRequest.getActive() : true);

        Set<Role> roles = new HashSet<>();
        if (userRequest.getRoles() != null && !userRequest.getRoles().isEmpty()) {
            roles = roleRepository.findByCodeIn(userRequest.getRoles());
        } else {
            roleRepository.findByCode("USER").ifPresent(roles::add);
        }
        user.setRoles(roles);

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

        String operatorEmail = SecurityUtils.getCurrentUserEmail();
        if (StringUtils.hasText(operatorEmail) && !"SYSTEM".equals(operatorEmail)) {
            User operator = userRepository.findByEmail(operatorEmail).orElse(null);
            if (operator != null) {
                user.setCreatedBy(operator);
                user.setUpdatedBy(operator);
            }
        }

        user = userRepository.save(user);

        auditLogService.log(
                "USER_CREATE",
                operatorEmail,
                String.format("Created user account: %s (ID: %s)", user.getEmail(), user.getId())
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
            if (!existingUser.isActive()) {
                throw new AppException("ACCOUNT_DISABLED", "Your account has been locked. Please contact the administrator.", HttpStatus.FORBIDDEN);
            }

            if (!StringUtils.hasText(existingUser.getProviderId())) {
                existingUser.setProviderId(googleId);
            }
            if (!existingUser.isEmailVerified()) {
                existingUser.setEmailVerified(true);
            }

            UserProfile profile = existingUser.getProfile();
            if (profile == null) {
                profile = UserProfile.builder()
                        .user(existingUser)
                        .firstName(firstName)
                        .lastName(lastName)
                        .avatarUrl(picture)
                        .build();
                existingUser.setProfile(profile);
            } else {
                if (!StringUtils.hasText(profile.getFirstName())) {
                    profile.setFirstName(firstName);
                }
                if (!StringUtils.hasText(profile.getLastName())) {
                    profile.setLastName(lastName);
                }
                if (!StringUtils.hasText(profile.getAvatarUrl()) && StringUtils.hasText(picture)) {
                    profile.setAvatarUrl(picture);
                }
            }

            return userRepository.save(existingUser);
        }).orElseGet(() -> {
            Set<Role> roles = new HashSet<>();
            roleRepository.findByCode("USER").ifPresent(roles::add);

            User newUser = User.builder()
                    .email(email)
                    .provider(AuthProvider.GOOGLE)
                    .providerId(googleId)
                    .roles(roles)
                    .active(true)
                    .emailVerified(true)
                    .build();

            UserProfile profile = UserProfile.builder()
                    .user(newUser)
                    .firstName(firstName)
                    .lastName(lastName)
                    .avatarUrl(picture)
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
                predicates.add(root.join("roles").get("code").in(filter.getRoles()));
            } else if (StringUtils.hasText(filter.getRole())) {
                predicates.add(cb.equal(root.join("roles").get("code"), filter.getRole().toUpperCase()));
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
        return updateUser(id, request, null);
    }

    @Override
    @Transactional
    public UserResponse updateUser(UUID id, UserUpdateRequest request, MultipartFile avatarFile) {
        String uploadedPublicId = null;
        try {
            if (avatarFile != null && !avatarFile.isEmpty()) {
                Map result = cloudinaryService.upload(avatarFile, "avatars");
                if (result != null && result.containsKey("secure_url")) {
                    String url = (String) result.get("secure_url");
                    uploadedPublicId = (String) result.get("public_id");
                    request.setAvatarUrl(url);
                    request.setAvatarPublicId(uploadedPublicId);
                }
            }

            User user = userRepository.findById(id)
                    .orElseThrow(() -> new AppException("USER_NOT_FOUND", "User not found", HttpStatus.NOT_FOUND));

            boolean oldActive = user.isActive();

            if (user.getProfile() == null) {
                user.setProfile(UserProfile.builder().user(user).build());
            }

            userMapper.updateUserFromRequest(request, user);

            if (request.getRoles() != null && !request.getRoles().isEmpty()) {
                Set<Role> newRoles = roleRepository.findByCodeIn(request.getRoles());
                user.setRoles(newRoles);
            }

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

            boolean deactivated = oldActive && !user.isActive();
            if (deactivated || (request.getRoles() != null && !request.getRoles().isEmpty())) {
                tokenService.revokeUserTokens(user.getEmail());
            }

            auditLogService.log("USER_UPDATE", operatorEmail, "Updated user with ID: " + user.getId());

            return userMapper.toResponse(user);
        } catch (Exception e) {
            if (uploadedPublicId != null) {
                try {
                    cloudinaryService.delete(uploadedPublicId);
                } catch (Exception delEx) {
                    log.error("Failed to delete orphaned Cloudinary asset {}: {}", uploadedPublicId, delEx.getMessage());
                }
            }
            throw e;
        }
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
    public UserResponse updateCurrentUserAccount(String email, UserUpdateRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("USER_NOT_FOUND", "User not found", HttpStatus.NOT_FOUND));

        request.setRoles(null);
        request.setActive(null);

        if (user.getProfile() == null) {
            user.setProfile(UserProfile.builder().user(user).build());
        }

        userMapper.updateUserFromRequest(request, user);

        if (user.getProfile() != null && user.getProfile().getUser() == null) {
            user.getProfile().setUser(user);
        }

        user.setUpdatedBy(user);
        user = userRepository.save(user);

        auditLogService.log("USER_ACCOUNT_UPDATE", email, "Updated own account profile details");

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
        long managementUsers = userRepository.countByRolesCodeIn(List.of("SUPER_ADMIN", "MANAGER"));
        long customerUsers = userRepository.countByRolesCode("USER");

        return UserStatisticsResponse.builder()
                .totalUsers(totalUsers)
                .onlineUsers(onlineUsers)
                .offlineUsers(Math.max(0, totalUsers - onlineUsers))
                .managementUsers(managementUsers)
                .customerUsers(customerUsers)
                .build();
    }
}
