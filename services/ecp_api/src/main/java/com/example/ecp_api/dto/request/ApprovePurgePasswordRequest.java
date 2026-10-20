package com.example.ecp_api.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record ApprovePurgePasswordRequest(@NotNull @PositiveOrZero Long version) {}
