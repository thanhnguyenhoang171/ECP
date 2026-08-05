package com.example.ecp_api.util;

import org.springframework.security.core.Authentication;
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
}
