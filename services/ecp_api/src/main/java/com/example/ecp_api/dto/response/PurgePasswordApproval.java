package com.example.ecp_api.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record PurgePasswordApproval(UUID userId, String email, LocalDateTime updatedAt, Long version) {}
