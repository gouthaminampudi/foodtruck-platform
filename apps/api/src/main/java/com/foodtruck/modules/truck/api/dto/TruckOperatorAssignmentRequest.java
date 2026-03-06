package com.foodtruck.modules.truck.api.dto;

import com.foodtruck.modules.truck.domain.TruckOperatorRole;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record TruckOperatorAssignmentRequest(
    @NotNull UUID truckId,
    @NotNull UUID userId,
    @NotNull TruckOperatorRole operatorRole,
    Boolean isActive
) {
}
