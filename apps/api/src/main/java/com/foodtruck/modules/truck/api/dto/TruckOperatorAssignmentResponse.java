package com.foodtruck.modules.truck.api.dto;

import com.foodtruck.modules.truck.domain.TruckOperatorRole;
import java.time.LocalDateTime;
import java.util.UUID;

public record TruckOperatorAssignmentResponse(
    UUID id,
    UUID truckId,
    UUID userId,
    TruckOperatorRole operatorRole,
    Boolean isActive,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
}
