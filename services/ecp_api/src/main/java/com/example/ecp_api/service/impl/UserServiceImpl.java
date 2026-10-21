package com.example.ecp_api.service.impl;
import com.example.ecp_api.security.DataOwnership;

import com.example.ecp_api.dto.request.GoogleLoginRequest;
import com.example.ecp_api.dto.request.RegisterRequest;
import com.example.ecp_api.dto.request.UpdateMyAccountRequest;
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

        return mapToResponseWithOnlineStatus(user);
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
            roles = resolveRoles(userRequest.getRoles());
        } else {
            roles = resolveRoles(Set.of("USER"));
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

        return mapToResponseWithOnlineStatus(user);
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
        return mapToResponseWithOnlineStatus(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(UUID id) {
        User user = userRepository.findById(id).filter(target -> target.getDeletedAt() == null && userVisible(target))
                .orElseThrow(() -> new AppException("USER_NOT_FOUND", "User not found", HttpStatus.NOT_FOUND));

        return mapToResponseWithOnlineStatus(user);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserResponse> getAllUsers(Pageable pageable) {
        Pageable finalPageable = PaginationUtils.applyStableSort(userPageable(pageable),
                Sort.Order.desc("createdAt"),
                Sort.Order.asc("id"));
        return mapToPageResponseWithOnlineStatus(userRepository.findAll(
                ((Specification<User>) (root, query, cb) -> cb.isNull(root.get("deletedAt"))).and(userScope()), finalPageable));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserResponse> searchUsers(UserFilterRequest filter, Pageable pageable) {
        Pageable finalPageable = PaginationUtils.applyStableSort(userPageable(pageable),
                Sort.Order.desc("createdAt"),
                Sort.Order.asc("id"));

        Specification<User> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isNull(root.get("deletedAt")));
            var profile = root.join("profile", jakarta.persistence.criteria.JoinType.LEFT);

            if (StringUtils.hasText(filter.getKeyword())) {
                String searchPattern = "%" + filter.getKeyword().toLowerCase() + "%";
                Predicate keywordPredicate = cb.or(
                        cb.like(cb.lower(root.get("email")), searchPattern),
                        cb.like(cb.lower(profile.get("phoneNumber")), searchPattern),
                        cb.like(cb.lower(profile.get("firstName")), searchPattern),
                        cb.like(cb.lower(profile.get("lastName")), searchPattern),
                        cb.like(cb.lower(cb.concat(cb.concat(cb.coalesce(profile.get("firstName"), ""), " "), cb.coalesce(profile.get("lastName"), ""))), searchPattern)
                );
                predicates.add(keywordPredicate);
            }
            if (StringUtils.hasText(filter.getEmail())) {
                predicates.add(cb.like(cb.lower(root.get("email")),
                        "%" + filter.getEmail().toLowerCase() + "%"));
            }
            Collection<String> roleCodes = filter.getRoles() != null && !filter.getRoles().isEmpty()
                    ? filter.getRoles() : StringUtils.hasText(filter.getRole()) ? Set.of(filter.getRole()) : Set.of();
            if (!roleCodes.isEmpty()) {
                var roleQuery = query.subquery(UUID.class);
                var correlatedUser = roleQuery.correlate(root);
                roleQuery.select(correlatedUser.get("id")).where(correlatedUser.join("roles").get("code").in(
                        roleCodes.stream().map(code -> code.trim().toUpperCase(Locale.ROOT).replaceFirst("^ROLE_", "")).toList()));
                predicates.add(cb.exists(roleQuery));
            }
            if (filter.getActive() != null) {
                predicates.add(cb.equal(root.get("active"), filter.getActive()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<User> userPage = userRepository.findAll(spec.and(userScope()), finalPageable);
        return mapToPageResponseWithOnlineStatus(userPage);
    }

    @Override
    @Transactional
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

            roleRepository.findForUpdate("SUPER_ADMIN");
            User user = userRepository.findById(id).filter(target -> target.getDeletedAt() == null && userVisible(target))
                    .orElseThrow(() -> new AppException("USER_NOT_FOUND", "User not found", HttpStatus.NOT_FOUND));

            // Re-check after acquiring the role lock: the target may have been promoted
            // between controller authorization and this transaction.
            ensureTargetManageable(user);
            boolean oldActive = user.isActive();
            String oldAvatarUrl = user.getProfile() == null ? null : user.getProfile().getAvatarUrl();
            Set<Role> newRoles = request.getRoles() == null ? null : resolveRoles(request.getRoles());
            if (user.getEmail().equalsIgnoreCase(SecurityUtils.getCurrentUserEmail()) && Boolean.FALSE.equals(request.getActive())) {
                throw new AppException("CANNOT_DISABLE_SELF", "Không thể tự khoá tài khoản đang đăng nhập.", HttpStatus.BAD_REQUEST);
            }
            boolean removesAdmin = newRoles != null && newRoles.stream().noneMatch(role -> "SUPER_ADMIN".equals(role.getCode()));
            if (user.hasRole("SUPER_ADMIN") && user.isActive() && (Boolean.FALSE.equals(request.getActive()) || removesAdmin)
                    && userRepository.countByDeletedAtIsNullAndActiveTrueAndRolesCode("SUPER_ADMIN") <= 1) {
                throw new AppException("LAST_SUPER_ADMIN", "Phải giữ lại ít nhất một Super Admin đang hoạt động.", HttpStatus.BAD_REQUEST);
            }
            if (request.getPassword() != null && user.getProvider() != AuthProvider.LOCAL) {
                throw new AppException("EXTERNAL_LOGIN_ACCOUNT", "Tài khoản này đăng nhập qua nhà cung cấp bên ngoài, không có mật khẩu nội bộ.", HttpStatus.BAD_REQUEST);
            }

            if (user.getProfile() == null) {
                user.setProfile(UserProfile.builder().user(user).build());
            }

            userMapper.updateUserFromRequest(request, user);

            if (newRoles != null) { user.setRoles(newRoles); }
            if (request.getPassword() != null) {
                user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
                user.setPasswordChangedAt(LocalDateTime.now());
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
            if (deactivated || newRoles != null || request.getPassword() != null) {
                tokenService.revokeUserTokens(user.getEmail());
            }

            auditLogService.log("USER_UPDATE", operatorEmail, "Updated user with ID: " + user.getId());
            String newAvatarUrl = user.getProfile() == null ? null : user.getProfile().getAvatarUrl();
            if (StringUtils.hasText(oldAvatarUrl) && !oldAvatarUrl.equals(newAvatarUrl)) {
                deleteReplacedAvatarAfterCommit(oldAvatarUrl, user.getId());
            }

            return mapToResponseWithOnlineStatus(user);
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
    @Transactional
    public void deleteUser(UUID id) {
        roleRepository.findForUpdate("SUPER_ADMIN");
        User user = userRepository.findById(id).filter(target -> target.getDeletedAt() == null && userVisible(target))
                .orElseThrow(() -> new AppException("USER_NOT_FOUND", "User not found", HttpStatus.NOT_FOUND));

        ensureTargetManageable(user);
        if (user.getEmail().equalsIgnoreCase(SecurityUtils.getCurrentUserEmail())) {
            throw new AppException("CANNOT_DELETE_SELF", "Không thể tự xoá tài khoản đang đăng nhập.", HttpStatus.BAD_REQUEST);
        }
        if (user.hasRole("SUPER_ADMIN") && user.isActive()
                && userRepository.countByDeletedAtIsNullAndActiveTrueAndRolesCode("SUPER_ADMIN") <= 1) {
            throw new AppException("LAST_SUPER_ADMIN", "Phải giữ lại ít nhất một Super Admin đang hoạt động.", HttpStatus.BAD_REQUEST);
        }
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
    @Transactional(readOnly = true)
    public UserResponse getCurrentUserAccount(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("USER_NOT_FOUND", "User not found", HttpStatus.NOT_FOUND));
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateCurrentUserAccount(String email, UpdateMyAccountRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("USER_NOT_FOUND", "User not found", HttpStatus.NOT_FOUND));

        if (user.getProfile() == null) {
            user.setProfile(UserProfile.builder().user(user).build());
        }

        userMapper.updateUserFromAccountRequest(request, user);

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
    public UserResponse updateCurrentUserAvatar(String email, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException("INVALID_FILE", "Uploaded avatar file is empty", HttpStatus.BAD_REQUEST);
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new AppException("INVALID_FILE_TYPE", "File must be a valid image format (JPEG, PNG, WebP, SVG)", HttpStatus.BAD_REQUEST);
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("USER_NOT_FOUND", "User not found", HttpStatus.NOT_FOUND));

        if (user.getProfile() == null) {
            user.setProfile(UserProfile.builder().user(user).build());
        }

        String oldAvatarPublicId = user.getProfile().getAvatarPublicId();

        Map uploadResult = cloudinaryService.upload(file, "avatars");
        if (uploadResult == null || !uploadResult.containsKey("secure_url")) {
            throw new AppException("FILE_UPLOAD_FAILED", "Failed to upload avatar to Cloudinary", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        String newAvatarUrl = (String) uploadResult.get("secure_url");
        String newAvatarPublicId = (String) uploadResult.get("public_id");

        if (StringUtils.hasText(oldAvatarPublicId)) {
            try {
                cloudinaryService.delete(oldAvatarPublicId);
                log.info("Auto-deleted old Cloudinary avatar asset: {}", oldAvatarPublicId);
            } catch (Exception e) {
                log.error("Failed to auto-delete old Cloudinary avatar asset {}: {}", oldAvatarPublicId, e.getMessage());
            }
        }

        user.getProfile().setAvatarUrl(newAvatarUrl);
        user.getProfile().setAvatarPublicId(newAvatarPublicId);
        user.setUpdatedBy(user);
        user = userRepository.save(user);

        auditLogService.log("USER_AVATAR_UPDATE", email, "Uploaded and updated profile avatar");

        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse deleteCurrentUserAvatar(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("USER_NOT_FOUND", "User not found", HttpStatus.NOT_FOUND));

        if (user.getProfile() != null) {
            String oldAvatarPublicId = user.getProfile().getAvatarPublicId();
            if (StringUtils.hasText(oldAvatarPublicId)) {
                try {
                    cloudinaryService.delete(oldAvatarPublicId);
                    log.info("Deleted Cloudinary avatar asset: {}", oldAvatarPublicId);
                } catch (Exception e) {
                    log.error("Failed to delete Cloudinary avatar asset {}: {}", oldAvatarPublicId, e.getMessage());
                }
            }

            user.getProfile().setAvatarUrl(null);
            user.getProfile().setAvatarPublicId(null);
            user.setUpdatedBy(user);
            user = userRepository.save(user);
        }

        auditLogService.log("USER_AVATAR_DELETE", email, "Removed profile avatar");

        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateCurrentUserBanner(String email, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException("INVALID_FILE", "Uploaded banner file is empty", HttpStatus.BAD_REQUEST);
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new AppException("INVALID_FILE_TYPE", "File must be a valid image format (JPEG, PNG, WebP, SVG)", HttpStatus.BAD_REQUEST);
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("USER_NOT_FOUND", "User not found", HttpStatus.NOT_FOUND));

        if (user.getProfile() == null) {
            user.setProfile(UserProfile.builder().user(user).build());
        }

        String oldBannerPublicId = user.getProfile().getBannerPublicId();

        Map uploadResult = cloudinaryService.upload(file, "banners");
        if (uploadResult == null || !uploadResult.containsKey("secure_url")) {
            throw new AppException("FILE_UPLOAD_FAILED", "Failed to upload banner to Cloudinary", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        String newBannerUrl = (String) uploadResult.get("secure_url");
        String newBannerPublicId = (String) uploadResult.get("public_id");

        if (StringUtils.hasText(oldBannerPublicId)) {
            try {
                cloudinaryService.delete(oldBannerPublicId);
                log.info("Auto-deleted old Cloudinary banner asset: {}", oldBannerPublicId);
            } catch (Exception e) {
                log.error("Failed to auto-delete old Cloudinary banner asset {}: {}", oldBannerPublicId, e.getMessage());
            }
        }

        user.getProfile().setBannerUrl(newBannerUrl);
        user.getProfile().setBannerPublicId(newBannerPublicId);
        user.setUpdatedBy(user);
        user = userRepository.save(user);

        auditLogService.log("USER_BANNER_UPDATE", email, "Uploaded and updated profile banner");

        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse deleteCurrentUserBanner(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("USER_NOT_FOUND", "User not found", HttpStatus.NOT_FOUND));

        if (user.getProfile() != null) {
            String oldBannerPublicId = user.getProfile().getBannerPublicId();
            if (StringUtils.hasText(oldBannerPublicId)) {
                try {
                    cloudinaryService.delete(oldBannerPublicId);
                    log.info("Deleted Cloudinary banner asset: {}", oldBannerPublicId);
                } catch (Exception e) {
                    log.error("Failed to delete Cloudinary banner asset {}: {}", oldBannerPublicId, e.getMessage());
                }
            }

            user.getProfile().setBannerUrl(null);
            user.getProfile().setBannerPublicId(null);
            user.setUpdatedBy(user);
            user = userRepository.save(user);
        }

        auditLogService.log("USER_BANNER_DELETE", email, "Removed profile banner");

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
    @Transactional(readOnly = true)
    public UserStatisticsResponse getStatistics() {
        Specification<User> present = ((Specification<User>) (root, query, cb) -> cb.isNull(root.get("deletedAt"))).and(userScope());
        long total = userRepository.count(present);
        long active = userRepository.count(present.and((root, query, cb) -> cb.isTrue(root.get("active"))));
        long management = userRepository.count(present.and((root, query, cb) -> {
            query.distinct(true);
            return root.join("roles").get("code").in(List.of("SUPER_ADMIN", "MANAGER"));
        }));
        long admins = userRepository.count(present.and((root, query, cb) -> cb.equal(root.join("roles").get("code"), "SUPER_ADMIN")));
        long managers = userRepository.count(present.and((root, query, cb) -> cb.equal(root.join("roles").get("code"), "MANAGER")));
        long online = DataOwnership.restricted() ? userRepository.findAll(present).stream().filter(user -> tokenService.isUserOnline(user.getEmail())).count() : Math.min(total, tokenService.countOnlineUsers());
        return UserStatisticsResponse.builder().totalUsers(total).activeUsers(active).inactiveUsers(total - active)
                .onlineUsers(online).offlineUsers(total - online).managementUsers(management).customerUsers(total - management)
                .superAdminUsers(admins).managerUsers(managers).build();
    }

    private boolean userVisible(User user) {
        return !DataOwnership.restricted() || user.getEmail().equalsIgnoreCase(SecurityUtils.getCurrentUserEmail())
                || user.getCreatedBy() != null && DataOwnership.visible(user.getCreatedBy().getEmail());
    }

    private Specification<User> userScope() {
        return (root, query, cb) -> !DataOwnership.restricted() ? cb.conjunction() : cb.or(
                cb.equal(root.get("email"), SecurityUtils.getCurrentUserEmail()),
                cb.equal(root.join("createdBy", jakarta.persistence.criteria.JoinType.LEFT).get("email"), SecurityUtils.getCurrentUserEmail()));
    }

    private void ensureTargetManageable(User user) {
        if (user.hasRole("SUPER_ADMIN") && !SecurityUtils.isSuperAdmin()) {
            throw new AppException("ACCESS_DENIED", "Chỉ Super Admin mới được thay đổi tài khoản Super Admin.", HttpStatus.FORBIDDEN);
        }
    }

    private Pageable userPageable(Pageable pageable) {
        List<Sort.Order> orders = pageable.getSort().stream().map(order -> {
            String property = "fullName".equals(order.getProperty()) ? "profile.firstName" : order.getProperty();
            if (!Set.of("id", "email", "createdAt", "updatedAt", "profile.firstName", "profile.lastName").contains(property)) {
                throw new AppException("INVALID_SORT", "Trường sắp xếp không hợp lệ.", HttpStatus.BAD_REQUEST);
            }
            return new Sort.Order(order.getDirection(), property);
        }).toList();
        return org.springframework.data.domain.PageRequest.of(pageable.getPageNumber(), Math.min(pageable.getPageSize(), 100), Sort.by(orders));
    }

    private Set<Role> resolveRoles(Set<String> codes) {
        if (codes.stream().anyMatch(code -> code == null || code.isBlank())) {
            throw new AppException("INVALID_ROLE", "Vai trò không hợp lệ.", HttpStatus.BAD_REQUEST);
        }
        if (codes.isEmpty()) { throw new AppException("ROLE_REQUIRED", "Phải chọn ít nhất một vai trò.", HttpStatus.BAD_REQUEST); }
        Set<String> normalized = codes.stream().map(code -> code.trim().toUpperCase(java.util.Locale.ROOT).replaceFirst("^ROLE_", ""))
                .collect(java.util.stream.Collectors.toSet());
        Set<Role> roles = roleRepository.findByCodeIn(normalized);
        if (DataOwnership.restricted()) {
            roles.stream().filter(role -> !Set.of("USER", "MANAGER").contains(role.getCode())).forEach(role -> DataOwnership.require(role.getCreatedBy()));
        }
        if (roles.size() != normalized.size()) { throw new AppException("ROLE_NOT_FOUND", "Có vai trò không tồn tại.", HttpStatus.BAD_REQUEST); }
        return roles;
    }

    private void deleteReplacedAvatarAfterCommit(String url, UUID userId) {
        Runnable cleanup = () -> {
            try {
                if (!userRepository.existsByProfileAvatarUrlAndIdNot(url, userId)) { cloudinaryService.deleteByUrl(url); }
            } catch (Exception error) {
                log.error("Could not delete replaced avatar for user {}", userId, error);
            }
        };
        if (org.springframework.transaction.support.TransactionSynchronizationManager.isSynchronizationActive()) {
            org.springframework.transaction.support.TransactionSynchronizationManager.registerSynchronization(
                    new org.springframework.transaction.support.TransactionSynchronization() {
                        @Override public void afterCommit() { cleanup.run(); }
                    });
        } else { cleanup.run(); }
    }

    private UserResponse mapToResponseWithOnlineStatus(User user) {
        if (user == null) return null;
        UserResponse response = userMapper.toResponse(user);
        if (response != null && StringUtils.hasText(user.getEmail())) {
            response.setIsOnline(tokenService.isUserOnline(user.getEmail()));
        }
        return response;
    }

    private PageResponse<UserResponse> mapToPageResponseWithOnlineStatus(Page<User> userPage) {
        PageResponse<UserResponse> pageResponse = userMapper.toPageResponse(userPage);
        if (pageResponse != null && pageResponse.getData() != null) {
            for (UserResponse resp : pageResponse.getData()) {
                if (resp != null && StringUtils.hasText(resp.getEmail())) {
                    resp.setIsOnline(tokenService.isUserOnline(resp.getEmail()));
                }
            }
        }
        return pageResponse;
    }
}
