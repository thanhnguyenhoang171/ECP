package com.example.ecp_api.config;

import com.example.ecp_api.entity.jpa.User;
import com.example.ecp_api.entity.jpa.UserProfile;
import com.example.ecp_api.enums.users.AuthProvider;
import com.example.ecp_api.enums.users.MembershipTier;
import com.example.ecp_api.enums.users.UserRole;
import com.example.ecp_api.repository.jpa.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        initializeSuperAdmin();
        initializeManager();
        initializeUser();
    }

    private void initializeSuperAdmin() {
        String adminUsername = "admin";
        String adminEmail = "admin@ecp.com";

        if (!userRepository.existsByUsername(adminUsername) && !userRepository.existsByEmail(adminEmail)) {
            log.info("Initializing super admin account...");
            
            User admin = User.builder()
                    .username(adminUsername)
                    .email(adminEmail)
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .role(UserRole.SUPER_ADMIN)
                    .provider(AuthProvider.LOCAL)
                    .active(true)
                    .emailVerified(true)
                    .build();

            UserProfile profile = UserProfile.builder()
                    .user(admin)
                    .firstName("Super")
                    .lastName("Admin")
                    .membershipTier(MembershipTier.MEMBER)
                    .build();

            admin.setProfile(profile);
            userRepository.save(admin);
            
            log.info("Super admin account initialized successfully.");
        }
    }

    private void initializeManager() {
        String managerUsername = "manager";
        String managerEmail = "manager@ecp.com";

        if (!userRepository.existsByUsername(managerUsername) && !userRepository.existsByEmail(managerEmail)) {
            log.info("Initializing manager account...");
            
            User manager = User.builder()
                    .username(managerUsername)
                    .email(managerEmail)
                    .passwordHash(passwordEncoder.encode("manager123"))
                    .role(UserRole.MANAGER)
                    .provider(AuthProvider.LOCAL)
                    .active(true)
                    .emailVerified(true)
                    .build();

            UserProfile profile = UserProfile.builder()
                    .user(manager)
                    .firstName("General")
                    .lastName("Manager")
                    .membershipTier(MembershipTier.MEMBER)
                    .build();

            manager.setProfile(profile);
            userRepository.save(manager);
            
            log.info("Manager account initialized successfully.");
        }
    }

    private void initializeUser() {
        String userUsername = "user";
        String userEmail = "user@ecp.com";

        if (!userRepository.existsByUsername(userUsername) && !userRepository.existsByEmail(userEmail)) {
            log.info("Initializing user account...");
            
            User user = User.builder()
                    .username(userUsername)
                    .email(userEmail)
                    .passwordHash(passwordEncoder.encode("user123"))
                    .role(UserRole.USER)
                    .provider(AuthProvider.LOCAL)
                    .active(true)
                    .emailVerified(true)
                    .build();

            UserProfile profile = UserProfile.builder()
                    .user(user)
                    .firstName("Regular")
                    .lastName("User")
                    .membershipTier(MembershipTier.MEMBER)
                    .build();

            user.setProfile(profile);
            userRepository.save(user);
            
            log.info("User account initialized successfully.");
        }
    }
}
