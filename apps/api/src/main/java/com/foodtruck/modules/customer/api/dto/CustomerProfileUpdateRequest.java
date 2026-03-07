package com.foodtruck.modules.customer.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;

public record CustomerProfileUpdateRequest(
    String firstName,
    String lastName,
    @Email String email,
    @Pattern(regexp = "^[0-9+()\\-\\s]{7,20}$", message = "Phone number is invalid") String phoneNumber,
    String preferredCuisines,
    String profileImageUrl,
    String currentPassword,
    String newPassword,
    String confirmNewPassword
) {
}
