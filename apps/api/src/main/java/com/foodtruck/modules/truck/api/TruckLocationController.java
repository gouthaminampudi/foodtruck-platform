package com.foodtruck.modules.truck.api;

import com.foodtruck.modules.truck.api.dto.TruckLocationRequest;
import com.foodtruck.modules.truck.api.dto.TruckLocationResponse;
import com.foodtruck.modules.truck.service.TruckActionPermission;
import com.foodtruck.modules.truck.service.TruckAuthorizationService;
import com.foodtruck.modules.truck.service.TruckLocationService;
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
@RequestMapping("/api/v1/truck-locations")
public class TruckLocationController {

    private final TruckLocationService truckLocationService;
    private final TruckAuthorizationService truckAuthorizationService;

    public TruckLocationController(
        TruckLocationService truckLocationService,
        TruckAuthorizationService truckAuthorizationService
    ) {
        this.truckLocationService = truckLocationService;
        this.truckAuthorizationService = truckAuthorizationService;
    }

    @GetMapping
    public List<TruckLocationResponse> listAll() {
        return truckLocationService.listAll();
    }

    @GetMapping("/{truckId}")
    public TruckLocationResponse getByTruckId(@PathVariable UUID truckId) {
        return truckLocationService.getByTruckId(truckId);
    }

    @PostMapping
    public ResponseEntity<TruckLocationResponse> create(
        @Valid @RequestBody TruckLocationRequest request,
        @RequestHeader(value = "X-Actor-User-Id", required = false) UUID actorUserId
    ) {
        truckAuthorizationService.authorize(request.truckId(), actorUserId, TruckActionPermission.LOCATION_MANAGE);
        TruckLocationResponse created = truckLocationService.create(request);
        return ResponseEntity.created(URI.create("/api/v1/truck-locations/" + created.truckId())).body(created);
    }

    @PutMapping("/{truckId}")
    public TruckLocationResponse update(
        @PathVariable UUID truckId,
        @Valid @RequestBody TruckLocationRequest request,
        @RequestHeader(value = "X-Actor-User-Id", required = false) UUID actorUserId
    ) {
        truckAuthorizationService.authorize(truckId, actorUserId, TruckActionPermission.LOCATION_MANAGE);
        return truckLocationService.update(truckId, request);
    }

    @DeleteMapping("/{truckId}")
    public ResponseEntity<Void> delete(
        @PathVariable UUID truckId,
        @RequestHeader(value = "X-Actor-User-Id", required = false) UUID actorUserId
    ) {
        truckAuthorizationService.authorize(truckId, actorUserId, TruckActionPermission.LOCATION_MANAGE);
        truckLocationService.delete(truckId);
        return ResponseEntity.noContent().build();
    }
}
