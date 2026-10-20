package com.example.ecp_api.dto.response;

public record PurgePasswordStatus(boolean configured, boolean approved, boolean canApprove) {}
