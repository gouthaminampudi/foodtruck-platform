package com.foodtruck.modules.truck.api.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public record TruckLocationRequest(
    @NotNull UUID truckId,
    @NotNull @DecimalMin(value = "-90.0") @DecimalMax(value = "90.0") Double latitude,
    @NotNull @DecimalMin(value = "-180.0") @DecimalMax(value = "180.0") Double longitude,
    @DecimalMin(value = "0.0") @DecimalMax(value = "360.0") BigDecimal headingDegrees,
    @DecimalMin(value = "0.0") BigDecimal speedMps,
    @DecimalMin(value = "0.0") BigDecimal accuracyMeters,
    Boolean isLive
) {
}
