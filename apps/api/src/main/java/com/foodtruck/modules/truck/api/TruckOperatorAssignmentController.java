package com.foodtruck.modules.truck.api;

import com.foodtruck.modules.truck.api.dto.TruckOperatorAssignmentRequest;
import com.foodtruck.modules.truck.api.dto.TruckOperatorAssignmentResponse;
import com.foodtruck.modules.truck.service.TruckActionPermission;
import com.foodtruck.modules.truck.service.TruckAuthorizationService;
import com.foodtruck.modules.truck.service.TruckOperatorAssignmentService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/truck-operators")
public class TruckOperatorAssignmentController {

    private final TruckOperatorAssignmentService truckOperatorAssignmentService;
    private final TruckAuthorizationService truckAuthorizationService;

    public TruckOperatorAssignmentController(
        TruckOperatorAssignmentService truckOperatorAssignmentService,
        TruckAuthorizationService truckAuthorizationService
    ) {
        this.truckOperatorAssignmentService = truckOperatorAssignmentService;
        this.truckAuthorizationService = truckAuthorizationService;
    }

    @GetMapping
    public List<TruckOperatorAssignmentResponse> listByTruckId(@RequestParam UUID truckId) {
        return truckOperatorAssignmentService.listByTruckId(truckId);
    }

    @GetMapping("/{id}")
    public TruckOperatorAssignmentResponse getById(@PathVariable UUID id) {
        return truckOperatorAssignmentService.getById(id);
    }

    @PostMapping
    public ResponseEntity<TruckOperatorAssignmentResponse> create(
        @Valid @RequestBody TruckOperatorAssignmentRequest request,
        @RequestHeader(value = "X-Actor-User-Id", required = false) UUID actorUserId
    ) {
        truckAuthorizationService.authorize(request.truckId(), actorUserId, TruckActionPermission.OPERATOR_MANAGE);
        TruckOperatorAssignmentResponse created = truckOperatorAssignmentService.create(request);
        return ResponseEntity.created(URI.create("/api/v1/truck-operators/" + created.id())).body(created);
    }

    @PutMapping("/{id}")
    public TruckOperatorAssignmentResponse update(
        @PathVariable UUID id,
        @Valid @RequestBody TruckOperatorAssignmentRequest request,
        @RequestHeader(value = "X-Actor-User-Id", required = false) UUID actorUserId
    ) {
        truckAuthorizationService.authorize(request.truckId(), actorUserId, TruckActionPermission.OPERATOR_MANAGE);
        return truckOperatorAssignmentService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
        @PathVariable UUID id,
        @RequestHeader(value = "X-Actor-User-Id", required = false) UUID actorUserId
    ) {
        TruckOperatorAssignmentResponse existing = truckOperatorAssignmentService.getById(id);
        truckAuthorizationService.authorize(existing.truckId(), actorUserId, TruckActionPermission.OPERATOR_MANAGE);
        truckOperatorAssignmentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
