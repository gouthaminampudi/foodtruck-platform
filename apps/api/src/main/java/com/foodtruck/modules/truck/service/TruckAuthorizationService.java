package com.foodtruck.modules.truck.service;

import com.foodtruck.modules.truck.domain.TruckOperatorRole;
import com.foodtruck.modules.truck.domain.TruckProfile;
import com.foodtruck.modules.truck.repository.TruckOperatorAssignmentRepository;
import com.foodtruck.modules.truck.repository.TruckProfileRepository;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TruckAuthorizationService {

    private final TruckProfileRepository truckProfileRepository;
    private final TruckOperatorAssignmentRepository truckOperatorAssignmentRepository;
    private final boolean enforceOperatorPermissions;

    public TruckAuthorizationService(
        TruckProfileRepository truckProfileRepository,
        TruckOperatorAssignmentRepository truckOperatorAssignmentRepository,
        @Value("${app.authz.enforce-operator-permissions:false}") boolean enforceOperatorPermissions
    ) {
        this.truckProfileRepository = truckProfileRepository;
        this.truckOperatorAssignmentRepository = truckOperatorAssignmentRepository;
        this.enforceOperatorPermissions = enforceOperatorPermissions;
    }

    public void authorize(UUID truckId, UUID actorUserId, TruckActionPermission permission) {
        if (!enforceOperatorPermissions) {
            return;
        }
        if (actorUserId == null) {
            throw forbidden("Missing X-Actor-User-Id header");
        }
        if (hasOwnerAccess(truckId, actorUserId)) {
            return;
        }
        if (hasOperatorPermission(truckId, actorUserId, permission)) {
            return;
        }
        throw forbidden("User is not authorized for this truck action");
    }

    public void authorizeOwnerCreate(UUID ownerUserId, UUID actorUserId) {
        if (!enforceOperatorPermissions) {
            return;
        }
        if (actorUserId == null) {
            throw forbidden("Missing X-Actor-User-Id header");
        }
        if (!actorUserId.equals(ownerUserId)) {
            throw forbidden("Only owner can create a truck profile");
        }
    }

    private boolean hasOwnerAccess(UUID truckId, UUID actorUserId) {
        TruckProfile truckProfile = truckProfileRepository.findById(truckId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Truck not found: " + truckId));
        return actorUserId.equals(truckProfile.getOwnerUserId());
    }

    private boolean hasOperatorPermission(UUID truckId, UUID actorUserId, TruckActionPermission permission) {
        return switch (permission) {
            case TRUCK_MANAGE, OPERATOR_MANAGE -> false;
            case MENU_MANAGE -> hasRole(truckId, actorUserId, TruckOperatorRole.CHEF);
            case LOCATION_MANAGE -> hasRole(truckId, actorUserId, TruckOperatorRole.DRIVER);
        };
    }

    private boolean hasRole(UUID truckId, UUID actorUserId, TruckOperatorRole role) {
        return truckOperatorAssignmentRepository
            .existsByTruckIdAndUserIdAndOperatorRoleAndIsActiveTrue(truckId, actorUserId, role);
    }

    private ResponseStatusException forbidden(String message) {
        return new ResponseStatusException(HttpStatus.FORBIDDEN, message);
    }
}
