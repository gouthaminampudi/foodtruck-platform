package com.foodtruck.modules.auth.api.dto;

import java.util.UUID;

public record AuthResponse(
    UUID userId,
    String username,
    String role,
    String authType,
    String accessToken
) {
}
