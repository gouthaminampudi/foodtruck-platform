package com.foodtruck.modules.customer.api;

import com.foodtruck.common.security.AppPrincipal;
import com.foodtruck.modules.customer.api.dto.CustomerProfileUpdateRequest;
import com.foodtruck.modules.customer.api.dto.CustomerResponse;
import com.foodtruck.modules.customer.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/customer/profile")
public class CustomerProfileController {

    private final CustomerService customerService;

    public CustomerProfileController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping
    public ResponseEntity<CustomerResponse> getOwnProfile(@AuthenticationPrincipal AppPrincipal principal) {
        return ResponseEntity.ok(customerService.getByUserId(principal.getUserId()));
    }

    @PutMapping
    public ResponseEntity<CustomerResponse> updateOwnProfile(
        @AuthenticationPrincipal AppPrincipal principal,
        @Valid @RequestBody CustomerProfileUpdateRequest request
    ) {
        return ResponseEntity.ok(customerService.updateOwnProfile(principal.getUserId(), request));
    }
}
