package com.foodtruck.modules.truck.api.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record MenuItemResponse(
    UUID id,
    UUID truckId,
    String itemName,
    String description,
    String category,
    String imageUrl,
    Integer priceCents,
    Boolean isVegetarian,
    Boolean isVegan,
    Boolean isGlutenFree,
    Short spiceLevel,
    Integer prepTimeMinutes,
    Integer sortOrder,
    Boolean isAvailable,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
}
