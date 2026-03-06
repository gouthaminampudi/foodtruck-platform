package com.foodtruck.modules.customer.api;

import com.foodtruck.modules.customer.api.dto.CustomerRequest;
import com.foodtruck.modules.customer.api.dto.CustomerResponse;
import com.foodtruck.modules.customer.service.CustomerService;
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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping
    public List<CustomerResponse> listAll() {
        return customerService.listAll();
    }

    @GetMapping("/{userId}")
    public CustomerResponse getById(@PathVariable UUID userId) {
        return customerService.getById(userId);
    }

    @PostMapping
    public ResponseEntity<CustomerResponse> create(@Valid @RequestBody CustomerRequest request) {
        CustomerResponse created = customerService.create(request);
        return ResponseEntity.created(URI.create("/api/v1/customers/" + created.userId())).body(created);
    }

    @PutMapping("/{userId}")
    public CustomerResponse update(@PathVariable UUID userId, @Valid @RequestBody CustomerRequest request) {
        return customerService.update(userId, request);
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> delete(@PathVariable UUID userId) {
        customerService.delete(userId);
        return ResponseEntity.noContent().build();
    }
}
