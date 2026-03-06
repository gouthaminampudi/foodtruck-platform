package com.foodtruck.modules.truck.api.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record TruckLocationResponse(
    UUID truckId,
    Double latitude,
    Double longitude,
    BigDecimal headingDegrees,
    BigDecimal speedMps,
    BigDecimal accuracyMeters,
    Boolean isLive,
    LocalDateTime updatedAt
) {
}
