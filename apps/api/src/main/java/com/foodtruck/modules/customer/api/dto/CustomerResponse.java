package com.foodtruck.modules.customer.api.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record CustomerResponse(
    UUID userId,
    String username,
    String email,
    Boolean isActive,
    String firstName,
    String lastName,
    String phoneNumber,
    String preferredCuisines,
    String profileImageUrl,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
}
