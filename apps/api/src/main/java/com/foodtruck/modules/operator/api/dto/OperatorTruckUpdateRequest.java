package com.foodtruck.modules.operator.api.dto;

import jakarta.validation.constraints.Pattern;
import java.util.List;

public record OperatorTruckUpdateRequest(
    String truckName,
    List<String> cuisineCategories,
    String description,
    @Pattern(regexp = "^[0-9+()\\-\\s]{7,20}$", message = "Phone number is invalid") String phoneNumber,
    Boolean isOnline
) {
}
