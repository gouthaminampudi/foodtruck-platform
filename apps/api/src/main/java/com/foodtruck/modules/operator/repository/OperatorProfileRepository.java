package com.foodtruck.modules.operator.repository;

import com.foodtruck.modules.operator.domain.OperatorProfile;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OperatorProfileRepository extends JpaRepository<OperatorProfile, UUID> {
}
