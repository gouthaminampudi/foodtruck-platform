package com.foodtruck.modules.admin.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;

public record AdminCustomerUpdateRequest(
    String firstName,
    String lastName,
    @Email String email,
    @Pattern(regexp = "^[0-9+()\\-\\s]{7,20}$", message = "Phone number is invalid") String phoneNumber,
    String preferredCuisines,
    String profileImageUrl,
    Boolean isActive
) {
}
