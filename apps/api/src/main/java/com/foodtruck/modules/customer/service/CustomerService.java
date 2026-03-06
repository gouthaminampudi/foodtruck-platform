package com.foodtruck.modules.customer.service;

import com.foodtruck.common.error.ResourceNotFoundException;
import com.foodtruck.modules.customer.api.dto.CustomerRequest;
import com.foodtruck.modules.customer.api.dto.CustomerResponse;
import com.foodtruck.modules.customer.domain.AppUser;
import com.foodtruck.modules.customer.domain.CustomerProfile;
import com.foodtruck.modules.customer.repository.AppUserRepository;
import com.foodtruck.modules.customer.repository.CustomerProfileRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CustomerService {

    private static final String CUSTOMER_ROLE = "CUSTOMER";

    private final AppUserRepository appUserRepository;
    private final CustomerProfileRepository customerProfileRepository;

    public CustomerService(
        AppUserRepository appUserRepository,
        CustomerProfileRepository customerProfileRepository
    ) {
        this.appUserRepository = appUserRepository;
        this.customerProfileRepository = customerProfileRepository;
    }

    public List<CustomerResponse> listAll() {
        return customerProfileRepository.findAll().stream().map(this::toResponse).toList();
    }

    public CustomerResponse getById(UUID userId) {
        CustomerProfile profile = customerProfileRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + userId));
        return toResponse(profile);
    }

    @Transactional
    public CustomerResponse create(CustomerRequest request) {
        if (appUserRepository.existsByEmailIgnoreCase(request.email().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        UUID userId = UUID.randomUUID();

        AppUser appUser = new AppUser();
        appUser.setId(userId);
        appUser.setEmail(request.email().trim().toLowerCase());
        appUser.setPasswordHash(request.passwordHash());
        appUser.setRole(CUSTOMER_ROLE);
        appUser.setIsActive(request.isActive() != null ? request.isActive() : true);
        appUserRepository.save(appUser);

        CustomerProfile profile = new CustomerProfile();
        profile.setUserId(userId);
        applyProfile(profile, request);

        return toResponse(customerProfileRepository.save(profile));
    }

    @Transactional
    public CustomerResponse update(UUID userId, CustomerRequest request) {
        AppUser appUser = appUserRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Customer user not found: " + userId));
        CustomerProfile profile = customerProfileRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found: " + userId));

        String normalizedEmail = request.email().trim().toLowerCase();
        if (!appUser.getEmail().equalsIgnoreCase(normalizedEmail)
            && appUserRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        appUser.setEmail(normalizedEmail);
        appUser.setPasswordHash(request.passwordHash());
        appUser.setRole(CUSTOMER_ROLE);
        appUser.setIsActive(request.isActive() != null ? request.isActive() : true);
        appUserRepository.save(appUser);

        applyProfile(profile, request);
        return toResponse(customerProfileRepository.save(profile));
    }

    @Transactional
    public void delete(UUID userId) {
        if (!customerProfileRepository.existsById(userId)) {
            throw new ResourceNotFoundException("Customer not found: " + userId);
        }
        customerProfileRepository.deleteById(userId);
        appUserRepository.deleteById(userId);
    }

    private void applyProfile(CustomerProfile profile, CustomerRequest request) {
        profile.setFirstName(request.firstName());
        profile.setLastName(request.lastName());
        profile.setPhoneNumber(request.phoneNumber());
        profile.setPreferredCuisines(request.preferredCuisines());
    }

    private CustomerResponse toResponse(CustomerProfile profile) {
        AppUser appUser = appUserRepository.findById(profile.getUserId())
            .orElseThrow(() -> new ResourceNotFoundException("Customer user not found: " + profile.getUserId()));

        return new CustomerResponse(
            profile.getUserId(),
            appUser.getEmail(),
            appUser.getIsActive(),
            profile.getFirstName(),
            profile.getLastName(),
            profile.getPhoneNumber(),
            profile.getPreferredCuisines(),
            profile.getCreatedAt(),
            profile.getUpdatedAt()
        );
    }
}
