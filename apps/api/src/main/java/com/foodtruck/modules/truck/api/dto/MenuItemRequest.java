package com.foodtruck.modules.truck.api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.util.UUID;

public record MenuItemRequest(
    @NotNull UUID truckId,
    @NotBlank String itemName,
    String description,
    String category,
    String imageUrl,
    @NotNull @Min(0) Integer priceCents,
    Boolean isVegetarian,
    Boolean isVegan,
    Boolean isGlutenFree,
    @PositiveOrZero Short spiceLevel,
    @PositiveOrZero Integer prepTimeMinutes,
    @PositiveOrZero Integer sortOrder,
    Boolean isAvailable
) {
}
