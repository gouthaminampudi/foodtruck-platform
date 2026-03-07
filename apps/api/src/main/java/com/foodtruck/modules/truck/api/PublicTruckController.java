package com.foodtruck.modules.truck.api;

import com.foodtruck.modules.truck.api.dto.MenuItemResponse;
import com.foodtruck.modules.truck.api.dto.NearbyTruckResponse;
import com.foodtruck.modules.truck.service.PublicTruckDiscoveryService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.List;
import java.util.UUID;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/v1/public/trucks")
public class PublicTruckController {

    private final PublicTruckDiscoveryService publicTruckDiscoveryService;

    public PublicTruckController(PublicTruckDiscoveryService publicTruckDiscoveryService) {
        this.publicTruckDiscoveryService = publicTruckDiscoveryService;
    }

    @GetMapping("/nearby")
    public List<NearbyTruckResponse> nearby(
        @RequestParam double latitude,
        @RequestParam double longitude,
        @RequestParam(defaultValue = "8000") @Min(500) @Max(100000) int radiusMeters
    ) {
        return publicTruckDiscoveryService.getNearbyTrucks(latitude, longitude, radiusMeters);
    }

    @GetMapping("/{truckId}/menu")
    public List<MenuItemResponse> menu(@PathVariable UUID truckId) {
        return publicTruckDiscoveryService.listPublicMenu(truckId);
    }
}
