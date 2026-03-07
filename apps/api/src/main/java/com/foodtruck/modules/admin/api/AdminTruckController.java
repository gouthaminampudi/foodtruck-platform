package com.foodtruck.modules.admin.api;

import com.foodtruck.modules.admin.service.AdminService;
import com.foodtruck.modules.truck.api.dto.TruckProfileRequest;
import com.foodtruck.modules.truck.api.dto.TruckProfileResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/trucks")
public class AdminTruckController {

    private final AdminService adminService;

    public AdminTruckController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping
    public List<TruckProfileResponse> listTrucks() {
        return adminService.listTrucks();
    }

    @GetMapping("/{truckId}")
    public TruckProfileResponse getTruck(@PathVariable UUID truckId) {
        return adminService.getTruck(truckId);
    }

    @PostMapping
    public ResponseEntity<TruckProfileResponse> createTruck(@Valid @RequestBody TruckProfileRequest request) {
        return ResponseEntity.ok(adminService.createTruck(request));
    }

    @PutMapping("/{truckId}")
    public TruckProfileResponse updateTruck(
        @PathVariable UUID truckId,
        @Valid @RequestBody TruckProfileRequest request
    ) {
        return adminService.updateTruck(truckId, request);
    }

    @PatchMapping("/{truckId}/activate")
    public ResponseEntity<TruckProfileResponse> activate(@PathVariable UUID truckId) {
        return ResponseEntity.ok(adminService.activateTruck(truckId));
    }

    @PatchMapping("/{truckId}/deactivate")
    public ResponseEntity<TruckProfileResponse> deactivate(@PathVariable UUID truckId) {
        return ResponseEntity.ok(adminService.deactivateTruck(truckId));
    }
}
