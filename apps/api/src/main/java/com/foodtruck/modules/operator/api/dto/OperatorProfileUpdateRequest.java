package com.foodtruck.modules.operator.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;

public record OperatorProfileUpdateRequest(
    String firstName,
    String lastName,
    @Email String email,
    @Pattern(regexp = "^[0-9+()\\-\\s]{7,20}$", message = "Phone number is invalid") String phoneNumber,
    String profileImageUrl,
    String currentPassword,
    String newPassword,
    String confirmNewPassword
) {
}
