package com.foodtruck.modules.truck.api;

import com.foodtruck.modules.truck.api.dto.TruckProfileRequest;
import com.foodtruck.modules.truck.api.dto.TruckProfileResponse;
import com.foodtruck.modules.truck.service.TruckActionPermission;
import com.foodtruck.modules.truck.service.TruckAuthorizationService;
import com.foodtruck.modules.truck.service.TruckProfileService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/trucks")
public class TruckProfileController {

    private final TruckProfileService truckProfileService;
    private final TruckAuthorizationService truckAuthorizationService;

    public TruckProfileController(
        TruckProfileService truckProfileService,
        TruckAuthorizationService truckAuthorizationService
    ) {
        this.truckProfileService = truckProfileService;
        this.truckAuthorizationService = truckAuthorizationService;
    }

    @GetMapping
    public List<TruckProfileResponse> listAll() {
        return truckProfileService.listAll();
    }

    @GetMapping("/{id}")
    public TruckProfileResponse getById(@PathVariable UUID id) {
        return truckProfileService.getById(id);
    }

    @PostMapping
    public ResponseEntity<TruckProfileResponse> create(
        @Valid @RequestBody TruckProfileRequest request,
        @RequestHeader(value = "X-Actor-User-Id", required = false) UUID actorUserId
    ) {
        truckAuthorizationService.authorizeOwnerCreate(request.ownerUserId(), actorUserId);
        TruckProfileResponse created = truckProfileService.create(request);
        return ResponseEntity.created(URI.create("/api/v1/trucks/" + created.id())).body(created);
    }

    @PutMapping("/{id}")
    public TruckProfileResponse update(
        @PathVariable UUID id,
        @Valid @RequestBody TruckProfileRequest request,
        @RequestHeader(value = "X-Actor-User-Id", required = false) UUID actorUserId
    ) {
        truckAuthorizationService.authorize(id, actorUserId, TruckActionPermission.TRUCK_MANAGE);
        return truckProfileService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
        @PathVariable UUID id,
        @RequestHeader(value = "X-Actor-User-Id", required = false) UUID actorUserId
    ) {
        truckAuthorizationService.authorize(id, actorUserId, TruckActionPermission.TRUCK_MANAGE);
        truckProfileService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
