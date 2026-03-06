package com.foodtruck.modules.truck.api.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record TruckProfileResponse(
    UUID id,
    UUID ownerUserId,
    String truckName,
    List<String> cuisineCategories,
    String description,
    String phoneNumber,
    String licenseNumber,
    BigDecimal ratingAvg,
    Integer ratingCount,
    String openingHoursJson,
    Integer serviceRadiusMeters,
    Boolean isVerified,
    Boolean isOnline,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
}
