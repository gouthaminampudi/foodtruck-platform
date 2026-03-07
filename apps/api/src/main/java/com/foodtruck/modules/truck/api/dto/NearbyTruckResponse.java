package com.foodtruck.modules.truck.api.dto;

import java.util.UUID;

public record NearbyTruckResponse(
    UUID truckId,
    String truckName,
    Double latitude,
    Double longitude,
    String foodCategory,
    Double distanceMiles,
    String menuUrl
) {
}
