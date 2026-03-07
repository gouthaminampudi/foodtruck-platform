package com.foodtruck.modules.truck.repository;

import com.foodtruck.modules.truck.domain.TruckProfile;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TruckProfileRepository extends JpaRepository<TruckProfile, UUID> {
    List<TruckProfile> findByIsActiveTrueAndIsOnlineTrue();
    Optional<TruckProfile> findFirstByOwnerUserId(UUID ownerUserId);
}
