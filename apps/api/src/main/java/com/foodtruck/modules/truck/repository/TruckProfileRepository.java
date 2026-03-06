package com.foodtruck.modules.truck.repository;

import com.foodtruck.modules.truck.domain.TruckProfile;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TruckProfileRepository extends JpaRepository<TruckProfile, UUID> {
}
