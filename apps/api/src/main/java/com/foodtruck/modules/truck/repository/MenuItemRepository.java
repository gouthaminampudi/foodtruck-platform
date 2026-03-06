package com.foodtruck.modules.truck.repository;

import com.foodtruck.modules.truck.domain.MenuItem;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MenuItemRepository extends JpaRepository<MenuItem, UUID> {
    List<MenuItem> findByTruckId(UUID truckId);
}
