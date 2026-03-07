package com.foodtruck.modules.truck.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record TruckProfileRequest(
    @NotNull UUID ownerUserId,
    @NotBlank String truckName,
    List<String> cuisineCategories,
    String description,
    @Pattern(regexp = "^[0-9+()\\-\\s]{7,20}$", message = "must be a valid phone number")
    String phoneNumber,
    String licenseNumber,
    @PositiveOrZero BigDecimal ratingAvg,
    @PositiveOrZero Integer ratingCount,
    String openingHoursJson,
    @PositiveOrZero Integer serviceRadiusMeters,
    Boolean isVerified,
    Boolean isOnline,
    Boolean isActive
) {
}
