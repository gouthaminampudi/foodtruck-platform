package com.foodtruck.modules.customer.repository;

import com.foodtruck.modules.customer.domain.CustomerProfile;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerProfileRepository extends JpaRepository<CustomerProfile, UUID> {
}
