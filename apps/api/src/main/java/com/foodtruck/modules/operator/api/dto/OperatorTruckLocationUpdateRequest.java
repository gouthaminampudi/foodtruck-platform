package com.foodtruck.modules.operator.api.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record OperatorTruckLocationUpdateRequest(
    @NotNull @Min(-90) @Max(90) Double latitude,
    @NotNull @Min(-180) @Max(180) Double longitude,
    BigDecimal headingDegrees,
    BigDecimal speedMps,
    BigDecimal accuracyMeters,
    Boolean isLive
) {
}
