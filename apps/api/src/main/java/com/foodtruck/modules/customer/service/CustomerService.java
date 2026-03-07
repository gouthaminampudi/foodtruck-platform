package com.foodtruck.modules.customer.service;

import com.foodtruck.common.error.ResourceNotFoundException;
import com.foodtruck.modules.admin.api.dto.AdminCustomerUpdateRequest;
import com.foodtruck.modules.customer.api.dto.CustomerProfileUpdateRequest;
import com.foodtruck.modules.customer.api.dto.CustomerResponse;
import com.foodtruck.modules.customer.domain.AppUser;
import com.foodtruck.modules.customer.domain.CustomerProfile;
import com.foodtruck.modules.customer.repository.AppUserRepository;
import com.foodtruck.modules.customer.repository.CustomerProfileRepository;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CustomerService {

    private final AppUserRepository appUserRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final PasswordEncoder passwordEncoder;

    public CustomerService(
        AppUserRepository appUserRepository,
        CustomerProfileRepository customerProfileRepository,
        PasswordEncoder passwordEncoder
    ) {
        this.appUserRepository = appUserRepository;
        this.customerProfileRepository = customerProfileRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public CustomerResponse getByUserId(UUID userId) {
        CustomerProfile profile = customerProfileRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found: " + userId));
        return toResponse(profile);
    }

    public List<CustomerResponse> listForAdmin(String query) {
        String normalizedQuery = query == null ? "" : query.trim().toLowerCase(Locale.ROOT);
        return customerProfileRepository.findAll().stream()
            .map(this::toResponse)
            .filter(customer -> matchesQuery(customer, normalizedQuery))
            .toList();
    }

    @Transactional
    public CustomerResponse updateByAdmin(UUID userId, AdminCustomerUpdateRequest request) {
        AppUser appUser = appUserRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Customer user not found: " + userId));
        CustomerProfile profile = customerProfileRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found: " + userId));

        if (request.email() != null) {
            String normalizedEmail = normalizeEmail(request.email());
            if (!appUser.getEmail().equalsIgnoreCase(normalizedEmail)
                && appUserRepository.existsByEmailIgnoreCase(normalizedEmail)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
            }
            appUser.setEmail(normalizedEmail);
        }

        if (request.isActive() != null) {
            appUser.setIsActive(request.isActive());
        }
        appUserRepository.save(appUser);

        if (request.firstName() != null) {
            profile.setFirstName(request.firstName());
        }
        if (request.lastName() != null) {
            profile.setLastName(request.lastName());
        }
        if (request.phoneNumber() != null) {
            profile.setPhoneNumber(request.phoneNumber());
        }
        if (request.preferredCuisines() != null) {
            profile.setPreferredCuisines(request.preferredCuisines());
        }
        if (request.profileImageUrl() != null) {
            profile.setProfileImageUrl(request.profileImageUrl());
        }

        return toResponse(customerProfileRepository.save(profile));
    }

    @Transactional
    public CustomerResponse setActive(UUID userId, boolean isActive) {
        AppUser appUser = appUserRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Customer user not found: " + userId));
        appUser.setIsActive(isActive);
        appUserRepository.save(appUser);
        return getByUserId(userId);
    }

    @Transactional
    public CustomerResponse updateOwnProfile(UUID userId, CustomerProfileUpdateRequest request) {
        AppUser appUser = appUserRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Customer user not found: " + userId));
        CustomerProfile profile = customerProfileRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found: " + userId));

        if (request.email() != null) {
            String normalizedEmail = normalizeEmail(request.email());
            if (!appUser.getEmail().equalsIgnoreCase(normalizedEmail)
                && appUserRepository.existsByEmailIgnoreCase(normalizedEmail)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
            }
            appUser.setEmail(normalizedEmail);
        }

        if (request.newPassword() != null && !request.newPassword().isBlank()) {
            if (request.currentPassword() == null || request.currentPassword().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is required");
            }
            if (!passwordEncoder.matches(request.currentPassword(), appUser.getPasswordHash())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is invalid");
            }
            if (!request.newPassword().equals(request.confirmNewPassword())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Passwords do not match");
            }
            if (!request.newPassword().matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$")) {
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Password must be at least 8 characters and include upper, lower, and number"
                );
            }
            appUser.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        }
        appUserRepository.save(appUser);

        if (request.firstName() != null) {
            profile.setFirstName(request.firstName());
        }
        if (request.lastName() != null) {
            profile.setLastName(request.lastName());
        }
        if (request.phoneNumber() != null) {
            profile.setPhoneNumber(request.phoneNumber());
        }
        if (request.preferredCuisines() != null) {
            profile.setPreferredCuisines(request.preferredCuisines());
        }
        if (request.profileImageUrl() != null) {
            profile.setProfileImageUrl(request.profileImageUrl());
        }
        return toResponse(customerProfileRepository.save(profile));
    }

    private boolean matchesQuery(CustomerResponse response, String query) {
        if (query.isBlank()) {
            return true;
        }
        return containsIgnoreCase(response.username(), query)
            || containsIgnoreCase(response.email(), query)
            || containsIgnoreCase(response.firstName(), query)
            || containsIgnoreCase(response.lastName(), query)
            || containsIgnoreCase(response.phoneNumber(), query);
    }

    private boolean containsIgnoreCase(String value, String query) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(query);
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private CustomerResponse toResponse(CustomerProfile profile) {
        AppUser appUser = appUserRepository.findById(profile.getUserId())
            .orElseThrow(() -> new ResourceNotFoundException("Customer user not found: " + profile.getUserId()));
        return new CustomerResponse(
            profile.getUserId(),
            appUser.getUsername(),
            appUser.getEmail(),
            appUser.getIsActive(),
            profile.getFirstName(),
            profile.getLastName(),
            profile.getPhoneNumber(),
            profile.getPreferredCuisines(),
            profile.getProfileImageUrl(),
            appUser.getCreatedAt(),
            profile.getUpdatedAt()
        );
    }
}
