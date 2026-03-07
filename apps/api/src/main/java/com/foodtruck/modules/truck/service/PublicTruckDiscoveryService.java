package com.foodtruck.modules.truck.service;

import com.foodtruck.modules.truck.api.dto.NearbyTruckResponse;
import com.foodtruck.modules.truck.api.dto.MenuItemResponse;
import com.foodtruck.modules.truck.domain.TruckLocation;
import com.foodtruck.modules.truck.domain.TruckProfile;
import com.foodtruck.modules.truck.repository.TruckLocationRepository;
import com.foodtruck.modules.truck.repository.TruckProfileRepository;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class PublicTruckDiscoveryService {

    private final TruckProfileRepository truckProfileRepository;
    private final TruckLocationRepository truckLocationRepository;
    private final MenuItemService menuItemService;

    public PublicTruckDiscoveryService(
        TruckProfileRepository truckProfileRepository,
        TruckLocationRepository truckLocationRepository,
        MenuItemService menuItemService
    ) {
        this.truckProfileRepository = truckProfileRepository;
        this.truckLocationRepository = truckLocationRepository;
        this.menuItemService = menuItemService;
    }

    public List<NearbyTruckResponse> getNearbyTrucks(double latitude, double longitude, int radiusMeters) {
        Map<UUID, TruckLocation> locationByTruckId = truckLocationRepository.findAll().stream()
            .filter(location -> Boolean.TRUE.equals(location.getIsLive()))
            .collect(Collectors.toMap(TruckLocation::getTruckId, Function.identity()));

        return truckProfileRepository.findByIsActiveTrueAndIsOnlineTrue().stream()
            .map(truck -> toNearby(truck, locationByTruckId.get(truck.getId()), latitude, longitude))
            .filter(response -> response != null)
            .filter(response -> response.distanceMiles() * 1609.34 <= radiusMeters)
            .sorted(Comparator.comparing(NearbyTruckResponse::distanceMiles))
            .toList();
    }

    public List<MenuItemResponse> listPublicMenu(UUID truckId) {
        return menuItemService.listByTruckId(truckId).stream()
            .filter(item -> Boolean.TRUE.equals(item.isAvailable()))
            .toList();
    }

    private NearbyTruckResponse toNearby(TruckProfile truck, TruckLocation location, double latitude, double longitude) {
        if (location == null) {
            return null;
        }

        double distanceMeters = haversineMeters(
            latitude,
            longitude,
            location.getLatitude(),
            location.getLongitude()
        );
        double distanceMiles = Math.round((distanceMeters / 1609.34) * 10.0) / 10.0;

        String foodCategory = "General";
        if (truck.getCuisineCategories() != null && truck.getCuisineCategories().length > 0) {
            foodCategory = truck.getCuisineCategories()[0];
        }

        return new NearbyTruckResponse(
            truck.getId(),
            truck.getTruckName(),
            location.getLatitude(),
            location.getLongitude(),
            foodCategory,
            distanceMiles,
            "/api/v1/public/trucks/" + truck.getId() + "/menu"
        );
    }

    private double haversineMeters(double lat1, double lon1, double lat2, double lon2) {
        final double earthRadiusMeters = 6_371_000;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
            + Math.cos(Math.toRadians(lat1))
            * Math.cos(Math.toRadians(lat2))
            * Math.sin(dLon / 2)
            * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadiusMeters * c;
    }
}
