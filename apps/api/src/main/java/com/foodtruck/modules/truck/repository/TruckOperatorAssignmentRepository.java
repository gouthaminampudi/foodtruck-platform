package com.foodtruck.modules.truck.repository;

import com.foodtruck.modules.truck.domain.TruckOperatorAssignment;
import com.foodtruck.modules.truck.domain.TruckOperatorRole;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TruckOperatorAssignmentRepository extends JpaRepository<TruckOperatorAssignment, UUID> {

    List<TruckOperatorAssignment> findByTruckId(UUID truckId);
    List<TruckOperatorAssignment> findByUserIdAndIsActiveTrue(UUID userId);
    Optional<TruckOperatorAssignment> findFirstByUserIdAndIsActiveTrue(UUID userId);

    Optional<TruckOperatorAssignment> findByTruckIdAndUserId(UUID truckId, UUID userId);

    boolean existsByTruckIdAndUserIdAndOperatorRoleAndIsActiveTrue(
        UUID truckId,
        UUID userId,
        TruckOperatorRole operatorRole
    );
}
