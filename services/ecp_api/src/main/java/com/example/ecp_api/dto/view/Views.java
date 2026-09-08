package com.example.ecp_api.dto.view;

/**
 * Marker interfaces for Jackson @JsonView role-based filtering.
 */
public final class Views {

    private Views() {
        // Private constructor to prevent instantiation
    }

    /**
     * View for public storefront and regular authenticated users.
     */
    public interface Public {}

    /**
     * View for administrators and managers (includes all Public fields plus audit/internal fields).
     */
    public interface Admin extends Public {}
}
