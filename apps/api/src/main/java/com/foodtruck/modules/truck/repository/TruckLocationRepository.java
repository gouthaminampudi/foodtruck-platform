package com.foodtruck.modules.truck.repository;

import com.foodtruck.modules.truck.domain.TruckLocation;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TruckLocationRepository extends JpaRepository<TruckLocation, UUID> {
}
