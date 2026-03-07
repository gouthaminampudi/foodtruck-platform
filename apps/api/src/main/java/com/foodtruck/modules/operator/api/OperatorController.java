package com.foodtruck.modules.operator.api;

import com.foodtruck.common.security.AppPrincipal;
import com.foodtruck.modules.operator.api.dto.OperatorProfileResponse;
import com.foodtruck.modules.operator.api.dto.OperatorProfileUpdateRequest;
import com.foodtruck.modules.operator.api.dto.OperatorTruckLocationUpdateRequest;
import com.foodtruck.modules.operator.api.dto.OperatorTruckUpdateRequest;
import com.foodtruck.modules.operator.service.OperatorService;
import com.foodtruck.modules.truck.api.dto.TruckLocationResponse;
import com.foodtruck.modules.truck.api.dto.TruckProfileResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/operator")
public class OperatorController {

    private final OperatorService operatorService;

    public OperatorController(OperatorService operatorService) {
        this.operatorService = operatorService;
    }

    @GetMapping("/profile")
    public ResponseEntity<OperatorProfileResponse> getOwnProfile(@AuthenticationPrincipal AppPrincipal principal) {
        return ResponseEntity.ok(operatorService.getOwnProfile(principal.getUserId()));
    }

    @PutMapping("/profile")
    public ResponseEntity<OperatorProfileResponse> updateOwnProfile(
        @AuthenticationPrincipal AppPrincipal principal,
        @Valid @RequestBody OperatorProfileUpdateRequest request
    ) {
        return ResponseEntity.ok(operatorService.updateOwnProfile(principal.getUserId(), request));
    }

    @GetMapping("/truck")
    public ResponseEntity<TruckProfileResponse> getOwnTruck(@AuthenticationPrincipal AppPrincipal principal) {
        return ResponseEntity.ok(operatorService.getOwnTruck(principal.getUserId()));
    }

    @PutMapping("/truck")
    public ResponseEntity<TruckProfileResponse> updateOwnTruck(
        @AuthenticationPrincipal AppPrincipal principal,
        @Valid @RequestBody OperatorTruckUpdateRequest request
    ) {
        return ResponseEntity.ok(operatorService.updateOwnTruck(principal.getUserId(), request));
    }

    @GetMapping("/truck/location")
    public ResponseEntity<TruckLocationResponse> getOwnTruckLocation(@AuthenticationPrincipal AppPrincipal principal) {
        return ResponseEntity.ok(operatorService.getOwnTruckLocation(principal.getUserId()));
    }

    @PutMapping("/truck/location")
    public ResponseEntity<TruckLocationResponse> updateOwnTruckLocation(
        @AuthenticationPrincipal AppPrincipal principal,
        @Valid @RequestBody OperatorTruckLocationUpdateRequest request
    ) {
        return ResponseEntity.ok(operatorService.updateOwnTruckLocation(principal.getUserId(), request));
    }
}
