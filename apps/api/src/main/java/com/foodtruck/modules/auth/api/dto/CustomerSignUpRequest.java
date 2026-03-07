package com.foodtruck.modules.auth.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CustomerSignUpRequest(
    @NotBlank @Size(min = 3, max = 100) String username,
    @NotBlank String firstName,
    @NotBlank String lastName,
    @NotBlank @Email String email,
    @Pattern(regexp = "^[0-9+()\\-\\s]{7,20}$", message = "Phone number is invalid") String phoneNumber,
    @NotBlank
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$",
        message = "Password must be at least 8 characters and include upper, lower, and number"
    )
    String password,
    @NotBlank String confirmPassword
) {
}
