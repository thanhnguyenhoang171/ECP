package com.example.ecp_api.util;

import com.example.ecp_api.security.CustomUserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Utility class for Spring Security related operations.
 */
public class SecurityUtils {

    private SecurityUtils() {
        // Private constructor to prevent instantiation
    }

    /**
     * Get the email of the current logged-in user.
     *
     * @return the email or "SYSTEM" if not authenticated
     */
    public static String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && 
            authentication.isAuthenticated() && 
            !authentication.getPrincipal().equals("anonymousUser")) {
            if (authentication.getPrincipal() instanceof CustomUserDetails userDetails) {
                return userDetails.getEmail();
            }
            return authentication.getName();
        }
        return "SYSTEM";
    }

    /**
     * Alias for getCurrentUserEmail.
     */
    public static String getCurrentUsername() {
        return getCurrentUserEmail();
    }

    /**
     * Check if current authenticated user has SUPER_ADMIN role.
     */
    public static boolean isSuperAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            for (GrantedAuthority authority : authentication.getAuthorities()) {
                String role = authority.getAuthority();
                if ("ROLE_SUPER_ADMIN".equalsIgnoreCase(role) || "SUPER_ADMIN".equalsIgnoreCase(role)) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Check if current authenticated user has MANAGER role.
     */
    public static boolean isManager() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            for (GrantedAuthority authority : authentication.getAuthorities()) {
                String role = authority.getAuthority();
                if ("ROLE_MANAGER".equalsIgnoreCase(role) || "MANAGER".equalsIgnoreCase(role)) {
                    return true;
                }
            }
        }
        return false;
    }
}

