package com.foodtruck.modules.operator.service;

import com.foodtruck.common.error.ResourceNotFoundException;
import com.foodtruck.modules.customer.domain.AppUser;
import com.foodtruck.modules.customer.repository.AppUserRepository;
import com.foodtruck.modules.operator.api.dto.OperatorProfileResponse;
import com.foodtruck.modules.operator.api.dto.OperatorProfileUpdateRequest;
import com.foodtruck.modules.operator.api.dto.OperatorTruckLocationUpdateRequest;
import com.foodtruck.modules.operator.api.dto.OperatorTruckUpdateRequest;
import com.foodtruck.modules.operator.domain.OperatorProfile;
import com.foodtruck.modules.operator.repository.OperatorProfileRepository;
import com.foodtruck.modules.truck.api.dto.TruckLocationResponse;
import com.foodtruck.modules.truck.api.dto.TruckProfileResponse;
import com.foodtruck.modules.truck.domain.TruckLocation;
import com.foodtruck.modules.truck.domain.TruckProfile;
import com.foodtruck.modules.truck.repository.TruckLocationRepository;
import com.foodtruck.modules.truck.repository.TruckOperatorAssignmentRepository;
import com.foodtruck.modules.truck.repository.TruckProfileRepository;
import com.foodtruck.modules.truck.service.TruckLocationService;
import com.foodtruck.modules.truck.service.TruckProfileService;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class OperatorService {

    private final AppUserRepository appUserRepository;
    private final OperatorProfileRepository operatorProfileRepository;
    private final TruckProfileRepository truckProfileRepository;
    private final TruckLocationRepository truckLocationRepository;
    private final TruckOperatorAssignmentRepository truckOperatorAssignmentRepository;
    private final TruckProfileService truckProfileService;
    private final TruckLocationService truckLocationService;
    private final PasswordEncoder passwordEncoder;

    public OperatorService(
        AppUserRepository appUserRepository,
        OperatorProfileRepository operatorProfileRepository,
        TruckProfileRepository truckProfileRepository,
        TruckLocationRepository truckLocationRepository,
        TruckOperatorAssignmentRepository truckOperatorAssignmentRepository,
        TruckProfileService truckProfileService,
        TruckLocationService truckLocationService,
        PasswordEncoder passwordEncoder
    ) {
        this.appUserRepository = appUserRepository;
        this.operatorProfileRepository = operatorProfileRepository;
        this.truckProfileRepository = truckProfileRepository;
        this.truckLocationRepository = truckLocationRepository;
        this.truckOperatorAssignmentRepository = truckOperatorAssignmentRepository;
        this.truckProfileService = truckProfileService;
        this.truckLocationService = truckLocationService;
        this.passwordEncoder = passwordEncoder;
    }

    public OperatorProfileResponse getOwnProfile(UUID operatorUserId) {
        AppUser user = appUserRepository.findById(operatorUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Operator user not found: " + operatorUserId));
        OperatorProfile profile = operatorProfileRepository.findById(operatorUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Operator profile not found: " + operatorUserId));
        return toProfileResponse(user, profile);
    }

    @Transactional
    public OperatorProfileResponse updateOwnProfile(UUID operatorUserId, OperatorProfileUpdateRequest request) {
        AppUser user = appUserRepository.findById(operatorUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Operator user not found: " + operatorUserId));
        OperatorProfile profile = operatorProfileRepository.findById(operatorUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Operator profile not found: " + operatorUserId));

        if (request.email() != null) {
            String normalizedEmail = request.email().trim().toLowerCase(Locale.ROOT);
            if (!user.getEmail().equalsIgnoreCase(normalizedEmail)
                && appUserRepository.existsByEmailIgnoreCase(normalizedEmail)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
            }
            user.setEmail(normalizedEmail);
        }

        if (request.newPassword() != null && !request.newPassword().isBlank()) {
            if (request.currentPassword() == null || request.currentPassword().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is required");
            }
            if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is invalid");
            }
            if (!request.newPassword().equals(request.confirmNewPassword())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Passwords do not match");
            }
            if (!request.newPassword().matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$")) {
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Password must be at least 8 characters and include upper, lower, and number"
                );
            }
            user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        }
        appUserRepository.save(user);

        if (request.firstName() != null) {
            profile.setFirstName(request.firstName());
        }
        if (request.lastName() != null) {
            profile.setLastName(request.lastName());
        }
        if (request.phoneNumber() != null) {
            profile.setPhoneNumber(request.phoneNumber());
        }
        if (request.profileImageUrl() != null) {
            profile.setProfileImageUrl(request.profileImageUrl());
        }
        return toProfileResponse(user, operatorProfileRepository.save(profile));
    }

    public TruckProfileResponse getOwnTruck(UUID operatorUserId) {
        return findAccessibleTruck(operatorUserId)
            .map(truck -> truckProfileService.getById(truck.getId()))
            .orElse(null);
    }

    @Transactional
    public TruckProfileResponse updateOwnTruck(UUID operatorUserId, OperatorTruckUpdateRequest request) {
        TruckProfile truck = resolveAccessibleTruck(operatorUserId);
        if (request.truckName() != null && !request.truckName().isBlank()) {
            truck.setTruckName(request.truckName().trim());
        }
        if (request.cuisineCategories() != null) {
            List<String> cuisines = request.cuisineCategories().stream()
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .toList();
            truck.setCuisineCategories(cuisines.toArray(String[]::new));
        }
        if (request.description() != null) {
            truck.setDescription(request.description());
        }
        if (request.phoneNumber() != null) {
            truck.setPhoneNumber(request.phoneNumber());
        }
        if (request.isOnline() != null) {
            truck.setIsOnline(request.isOnline());
        }
        truckProfileRepository.save(truck);
        return truckProfileService.getById(truck.getId());
    }

    public TruckLocationResponse getOwnTruckLocation(UUID operatorUserId) {
        return findAccessibleTruck(operatorUserId)
            .flatMap(truck -> truckLocationRepository.findById(truck.getId()))
            .map(location -> truckLocationService.getByTruckId(location.getTruckId()))
            .orElse(null);
    }

    @Transactional
    public TruckLocationResponse updateOwnTruckLocation(UUID operatorUserId, OperatorTruckLocationUpdateRequest request) {
        TruckProfile truck = resolveAccessibleTruck(operatorUserId);
        TruckLocation location = truckLocationRepository.findById(truck.getId()).orElseGet(() -> {
            TruckLocation created = new TruckLocation();
            created.setTruckId(truck.getId());
            return created;
        });
        location.setLatitude(request.latitude());
        location.setLongitude(request.longitude());
        location.setHeadingDegrees(request.headingDegrees());
        location.setSpeedMps(request.speedMps());
        location.setAccuracyMeters(request.accuracyMeters());
        location.setIsLive(request.isLive() != null ? request.isLive() : true);
        truckLocationRepository.save(location);
        return truckLocationService.getByTruckId(truck.getId());
    }

    private TruckProfile resolveAccessibleTruck(UUID operatorUserId) {
        return findAccessibleTruck(operatorUserId)
            .orElseThrow(() -> new ResourceNotFoundException("No truck assigned to operator"));
    }

    private java.util.Optional<TruckProfile> findAccessibleTruck(UUID operatorUserId) {
        return truckProfileRepository.findFirstByOwnerUserId(operatorUserId)
            .or(() -> truckOperatorAssignmentRepository.findFirstByUserIdAndIsActiveTrue(operatorUserId)
                .flatMap(assignment -> truckProfileRepository.findById(assignment.getTruckId())));
    }

    private OperatorProfileResponse toProfileResponse(AppUser user, OperatorProfile profile) {
        return new OperatorProfileResponse(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getIsActive(),
            profile.getFirstName(),
            profile.getLastName(),
            profile.getPhoneNumber(),
            profile.getProfileImageUrl(),
            user.getCreatedAt(),
            profile.getUpdatedAt()
        );
    }
}
