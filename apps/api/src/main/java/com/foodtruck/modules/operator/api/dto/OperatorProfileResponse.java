package com.foodtruck.modules.operator.api.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record OperatorProfileResponse(
    UUID userId,
    String username,
    String email,
    Boolean isActive,
    String firstName,
    String lastName,
    String phoneNumber,
    String profileImageUrl,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
}
