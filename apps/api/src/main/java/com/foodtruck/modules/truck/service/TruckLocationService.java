package com.foodtruck.modules.truck.service;

import com.foodtruck.common.error.ResourceNotFoundException;
import com.foodtruck.modules.truck.api.dto.TruckLocationRequest;
import com.foodtruck.modules.truck.api.dto.TruckLocationResponse;
import com.foodtruck.modules.truck.domain.TruckLocation;
import com.foodtruck.modules.truck.repository.TruckLocationRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class TruckLocationService {

    private final TruckLocationRepository truckLocationRepository;

    public TruckLocationService(TruckLocationRepository truckLocationRepository) {
        this.truckLocationRepository = truckLocationRepository;
    }

    public List<TruckLocationResponse> listAll() {
        return truckLocationRepository.findAll().stream().map(this::toResponse).toList();
    }

    public TruckLocationResponse getByTruckId(UUID truckId) {
        TruckLocation truckLocation = truckLocationRepository.findById(truckId)
            .orElseThrow(() -> new ResourceNotFoundException("Truck location not found for truck: " + truckId));
        return toResponse(truckLocation);
    }

    public TruckLocationResponse create(TruckLocationRequest request) {
        TruckLocation truckLocation = new TruckLocation();
        truckLocation.setTruckId(request.truckId());
        apply(truckLocation, request);
        return toResponse(truckLocationRepository.save(truckLocation));
    }

    public TruckLocationResponse update(UUID truckId, TruckLocationRequest request) {
        TruckLocation truckLocation = truckLocationRepository.findById(truckId)
            .orElseThrow(() -> new ResourceNotFoundException("Truck location not found for truck: " + truckId));
        apply(truckLocation, request);
        return toResponse(truckLocationRepository.save(truckLocation));
    }

    public void delete(UUID truckId) {
        if (!truckLocationRepository.existsById(truckId)) {
            throw new ResourceNotFoundException("Truck location not found for truck: " + truckId);
        }
        truckLocationRepository.deleteById(truckId);
    }

    private void apply(TruckLocation truckLocation, TruckLocationRequest request) {
        truckLocation.setTruckId(request.truckId());
        truckLocation.setLatitude(request.latitude());
        truckLocation.setLongitude(request.longitude());
        truckLocation.setHeadingDegrees(request.headingDegrees());
        truckLocation.setSpeedMps(request.speedMps());
        truckLocation.setAccuracyMeters(request.accuracyMeters());
        truckLocation.setIsLive(request.isLive() != null ? request.isLive() : true);
    }

    private TruckLocationResponse toResponse(TruckLocation truckLocation) {
        return new TruckLocationResponse(
            truckLocation.getTruckId(),
            truckLocation.getLatitude(),
            truckLocation.getLongitude(),
            truckLocation.getHeadingDegrees(),
            truckLocation.getSpeedMps(),
            truckLocation.getAccuracyMeters(),
            truckLocation.getIsLive(),
            truckLocation.getUpdatedAt()
        );
    }
}
