package com.foodtruck.modules.admin.api;

import com.foodtruck.modules.admin.api.dto.AdminCustomerUpdateRequest;
import com.foodtruck.modules.admin.service.AdminService;
import com.foodtruck.modules.customer.api.dto.CustomerResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/customers")
public class AdminCustomerController {

    private final AdminService adminService;

    public AdminCustomerController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping
    public List<CustomerResponse> listCustomers(@RequestParam(required = false) String q) {
        return adminService.listCustomers(q);
    }

    @GetMapping("/{userId}")
    public CustomerResponse getCustomer(@PathVariable UUID userId) {
        return adminService.getCustomer(userId);
    }

    @PutMapping("/{userId}")
    public CustomerResponse updateCustomer(
        @PathVariable UUID userId,
        @Valid @RequestBody AdminCustomerUpdateRequest request
    ) {
        return adminService.updateCustomer(userId, request);
    }

    @PatchMapping("/{userId}/activate")
    public ResponseEntity<CustomerResponse> activate(@PathVariable UUID userId) {
        return ResponseEntity.ok(adminService.activateCustomer(userId));
    }

    @PatchMapping("/{userId}/deactivate")
    public ResponseEntity<CustomerResponse> deactivate(@PathVariable UUID userId) {
        return ResponseEntity.ok(adminService.deactivateCustomer(userId));
    }
}
