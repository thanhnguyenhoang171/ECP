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
     * Get the username of the current logged-in user.
     *
     * @return the username or "SYSTEM" if not authenticated
     */
    public static String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && 
            authentication.isAuthenticated() && 
            !authentication.getPrincipal().equals("anonymousUser")) {
            return authentication.getName();
        }
        return "SYSTEM";
    }
}
