package com.foodtruck.modules.truck.service;

import com.foodtruck.common.error.ResourceNotFoundException;
import com.foodtruck.modules.truck.api.dto.TruckProfileRequest;
import com.foodtruck.modules.truck.api.dto.TruckProfileResponse;
import com.foodtruck.modules.truck.domain.TruckProfile;
import com.foodtruck.modules.truck.repository.TruckProfileRepository;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class TruckProfileService {

    private final TruckProfileRepository truckProfileRepository;

    public TruckProfileService(TruckProfileRepository truckProfileRepository) {
        this.truckProfileRepository = truckProfileRepository;
    }

    public List<TruckProfileResponse> listAll() {
        return truckProfileRepository.findAll().stream().map(this::toResponse).toList();
    }

    public TruckProfileResponse getById(UUID id) {
        TruckProfile truckProfile = truckProfileRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Truck profile not found: " + id));
        return toResponse(truckProfile);
    }

    public TruckProfileResponse create(TruckProfileRequest request) {
        TruckProfile truckProfile = new TruckProfile();
        truckProfile.setId(UUID.randomUUID());
        apply(truckProfile, request);
        return toResponse(truckProfileRepository.save(truckProfile));
    }

    public TruckProfileResponse update(UUID id, TruckProfileRequest request) {
        TruckProfile truckProfile = truckProfileRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Truck profile not found: " + id));
        apply(truckProfile, request);
        return toResponse(truckProfileRepository.save(truckProfile));
    }

    public void delete(UUID id) {
        if (!truckProfileRepository.existsById(id)) {
            throw new ResourceNotFoundException("Truck profile not found: " + id);
        }
        truckProfileRepository.deleteById(id);
    }

    private void apply(TruckProfile truckProfile, TruckProfileRequest request) {
        truckProfile.setOwnerUserId(request.ownerUserId());
        truckProfile.setTruckName(request.truckName().trim());
        truckProfile.setCuisineCategories(request.cuisineCategories() == null
            ? null
            : request.cuisineCategories().stream()
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .toArray(String[]::new));
        truckProfile.setDescription(request.description());
        truckProfile.setPhoneNumber(request.phoneNumber());
        truckProfile.setLicenseNumber(request.licenseNumber());
        truckProfile.setRatingAvg(request.ratingAvg() != null ? request.ratingAvg() : BigDecimal.ZERO);
        truckProfile.setRatingCount(request.ratingCount() != null ? request.ratingCount() : 0);
        truckProfile.setOpeningHoursJson(request.openingHoursJson());
        truckProfile.setServiceRadiusMeters(request.serviceRadiusMeters() != null ? request.serviceRadiusMeters() : 5000);
        truckProfile.setIsVerified(request.isVerified() != null ? request.isVerified() : false);
        truckProfile.setIsOnline(request.isOnline() != null ? request.isOnline() : false);
        truckProfile.setIsActive(request.isActive() != null ? request.isActive() : true);
    }

    private TruckProfileResponse toResponse(TruckProfile truckProfile) {
        return new TruckProfileResponse(
            truckProfile.getId(),
            truckProfile.getOwnerUserId(),
            truckProfile.getTruckName(),
            truckProfile.getCuisineCategories() == null ? List.of() : Arrays.asList(truckProfile.getCuisineCategories()),
            truckProfile.getDescription(),
            truckProfile.getPhoneNumber(),
            truckProfile.getLicenseNumber(),
            truckProfile.getRatingAvg(),
            truckProfile.getRatingCount(),
            truckProfile.getOpeningHoursJson(),
            truckProfile.getServiceRadiusMeters(),
            truckProfile.getIsVerified(),
            truckProfile.getIsOnline(),
            truckProfile.getIsActive(),
            truckProfile.getCreatedAt(),
            truckProfile.getUpdatedAt()
        );
    }
}
