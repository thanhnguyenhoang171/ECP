package com.example.ecp_api.util;

import com.example.ecp_api.security.CustomUserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

/**
 * Utility class for Spring Security related operations.
 */
public class SecurityUtils {

    private SecurityUtils() {
        // Private constructor to prevent instantiation
    }

    /**
     * Get the UUID of the current logged-in user.
     *
     * @return the user UUID or null if not authenticated
     */
    public static UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && 
            authentication.isAuthenticated() && 
            !authentication.getPrincipal().equals("anonymousUser")) {
            if (authentication.getPrincipal() instanceof CustomUserDetails userDetails) {
                return userDetails.getId();
            }
        }
        return null;
    }

    /**
     * Get the User ID String (UUID) of current logged-in user for Auditor auditing.
     *
     * @return User ID UUID String or "SYSTEM" if unauthenticated
     */
    public static String getCurrentUserIdString() {
        UUID id = getCurrentUserId();
        return id != null ? id.toString() : "SYSTEM";
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
     * Get JSON representation of current logged-in user for createdBy / updatedBy audit tracking.
     * Format: {"id":"<uuid>","email":"<email>"} or {"id":null,"email":"SYSTEM"}
     *
     * @return Audit JSON string
     */
    public static String getCurrentUserAuditJson() {
        UUID id = getCurrentUserId();
        String email = getCurrentUserEmail();
        if (id == null) {
            return "{\"id\":null,\"email\":\"" + (email != null ? email : "SYSTEM") + "\"}";
        }
        return "{\"id\":\"" + id + "\",\"email\":\"" + email + "\"}";
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
