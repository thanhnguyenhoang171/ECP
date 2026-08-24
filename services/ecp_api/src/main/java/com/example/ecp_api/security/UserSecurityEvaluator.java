package com.example.ecp_api.security;

import com.example.ecp_api.entity.jpa.User;
import com.example.ecp_api.repository.jpa.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.UUID;

@Component("userSecurityEvaluator")
@RequiredArgsConstructor
public class UserSecurityEvaluator {

    private final UserRepository userRepository;

    public boolean isSuperAdmin(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equalsIgnoreCase("ROLE_SUPER_ADMIN"));
    }

    public boolean canManageUser(Authentication authentication, UUID targetUserId) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        if (isSuperAdmin(authentication)) {
            return true;
        }

        // If target user is SUPER_ADMIN, non-SUPER_ADMIN cannot modify
        User targetUser = userRepository.findById(targetUserId).orElse(null);
        if (targetUser != null && targetUser.hasRole("SUPER_ADMIN")) {
            return false;
        }

        // If current user is managing their own account
        if (authentication.getPrincipal() instanceof CustomUserDetails userDetails) {
            if (userDetails.getId().equals(targetUserId)) {
                return true;
            }
        }

        // Must have user:update or user:manage permission
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("user:update") || a.equals("user:delete") || a.equals("user:manage"));
    }

    public boolean canAssignRoles(Authentication authentication, Set<String> targetRoleCodes) {
        if (authentication == null || !authentication.isAuthenticated() || targetRoleCodes == null) {
            return false;
        }
        if (isSuperAdmin(authentication)) {
            return true;
        }

        // Non-super-admins cannot assign SUPER_ADMIN role
        boolean containsSuperAdmin = targetRoleCodes.stream()
                .anyMatch(code -> code.equalsIgnoreCase("SUPER_ADMIN"));

        return !containsSuperAdmin;
    }
}
