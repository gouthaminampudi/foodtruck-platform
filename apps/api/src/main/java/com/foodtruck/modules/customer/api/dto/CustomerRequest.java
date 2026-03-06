package com.foodtruck.modules.customer.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CustomerRequest(
    @NotBlank @Email String email,
    @NotBlank String passwordHash,
    String firstName,
    String lastName,
    @Pattern(regexp = "^[0-9+()\\-\\s]{7,20}$", message = "must be a valid phone number")
    String phoneNumber,
    String preferredCuisines,
    Boolean isActive
) {
}
